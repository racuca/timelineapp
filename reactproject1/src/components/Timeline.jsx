import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const Timeline = ({ svgRef, containerRef, zoomBehaviorRef, events, isVertical }) => {
    const handleZoomIn = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(zoomBehaviorRef.current.scaleBy, 1.2); // 1.2배 줌 인
    };

    const handleZoomOut = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(zoomBehaviorRef.current.scaleBy, 0.8); // 0.8배 줌 아웃
    };

    const handleZoomReset = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(zoomBehaviorRef.current.transform, d3.zoomIdentity); // 초기 상태로 줌 리셋
    };
    const [selectedEvent, setSelectedEvent] = useState(null); // 선택된 이벤트 정보

    const baseWidth = 800; // 기본 타임라인 너비
    const baseEventSpacing = 100; // 이벤트 간 기본 간격
    const [dynamicWidth, setDynamicWidth] = useState(window.innerWidth * 0.8);

    // 이벤트 개수 기반 내부 SVG 크기 계산
    const eventCount = events.length;
    const innerWidth = Math.max(baseWidth, eventCount * baseEventSpacing + 100);
    const innerHeight = isVertical ? innerWidth : 540; 

    useEffect(() => {
        const handleResize = () => {
            console.log("window width change", window.innerWidth);
            setDynamicWidth(Math.max(baseWidth, window.innerWidth * 0.8));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const size = Math.max(baseWidth, events.length * baseEventSpacing + 100); // 타임라인 너비 계산
        const width = isVertical ? dynamicWidth : size; // 가로 방향이면 너비를 늘림
        const height = isVertical ? size : 600; // 세로 방향이면 높이를 늘림
        //console.log("useEffect", width, height);

        //svg.attr("width", width).attr("height", height).style("background", "#f9f9f9");
        svg.attr("width", innerWidth) // 부모 div에 맞춤
            .attr("height", innerHeight)
            .style("background", "#f9f9f9");

        // Clear previous elements
        svg.selectAll("*").remove();

        // Append a group for zoomable content
        const g = svg.append("g");

        // Define zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 3]) // 최소 0.5배, 최대 3배 줌
            .on("zoom", (event) => {
                g.attr("transform", event.transform); // 그룹 요소에 변환 적용
            });

        svg.call(zoom); // SVG에 줌 이벤트 연결
        zoomBehaviorRef.current = zoom;

        // Draw the timeline
        const linePos = isVertical ? width / 2 : height / 2; // 세로/가로 방향에 따라 선 위치 설정
        g.append("line")
            .attr("x1", isVertical ? linePos : 50)
            .attr("y1", isVertical ? 50 : linePos)
            .attr("x2", isVertical ? linePos : width - 50)
            .attr("y2", isVertical ? height - 50 : linePos)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        // Draw events with branches and cards
        const eventGroups = g.selectAll(".event")
            .data(events)
            .enter()
            .append("g")
            .attr("class", "event")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${isVertical ? linePos : 50 + i * baseEventSpacing}, ${isVertical ? 50 + i * baseEventSpacing : linePos
                    })`
            
            ).on("click", (event, d) => {
                setSelectedEvent(d); // 박스를 클릭하면 선택된 이벤트 설정
            });

        // Add text and dynamically calculate box size
        const textElements = eventGroups.append("text")
            .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -80 : 100) : 0))
            .attr("y", (d, i) => (isVertical ? 20 : i % 2 === 0 ? -80 : 50))
            .attr("text-anchor", "left")
            .style("font-size", "12px");

        // 두 줄로 텍스트 추가: 첫 줄은 d.createdt, 둘째 줄은 d.description
        textElements.each(function (d, i) {
            const text = d3.select(this);
            text.append("tspan")
                .text(d.createdt) // 첫 번째 줄 (날짜)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "0em")
                .style("font-weight", "bold");

            text.append("tspan")
                .text(d.title) // 두 번째 줄 (제목)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "1.5em")
                .style("font-weight", "bold");

            text.append("tspan")
                .text(d.description) // 세 번째 줄 (설명)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "2em");
        });

        // 박스 추가
        textElements.each(function (d, i) {
            const bbox = this.getBBox(); // Get text size dynamically
            const padding = 20;

            // Add background rectangle for each text
            d3.select(this.parentNode)
                .insert("rect", "text")
                .attr("x", isVertical ? (i % 2 === 0 ? bbox.x-10 : bbox.x-10) : bbox.x-10)
                .attr("y", isVertical ? (i % 2 === 0 ? bbox.y-10 : bbox.y-10) : bbox.y-10)
                .attr("width", bbox.width + padding)
                .attr("height", bbox.height + padding)
                .attr("rx", 4)  // 모서리 radius
                .attr("ry", 4)
                .attr("fill", "white")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .on("click", (event, d) => {
                    setSelectedEvent(d); // 박스를 클릭하면 이벤트 정보 저장
                })
                .style("cursor", "pointer")
                .lower(); // Send rectangle to the back

            // 타임라인과 박스를 연결하는 선 추가
            d3.select(this.parentNode)
                .append("line")
                .attr("x1", isVertical ? 0 : bbox.x)
                .attr("y1", isVertical ? 0 : 0)
                .attr("x2", isVertical ? (i % 2 === 0 ? bbox.x +bbox.width + 10 : bbox.x - 10) : bbox.x)
                .attr("y2", isVertical ? bbox.y : (i % 2 === 0 ? bbox.y + bbox.height + padding - 10: bbox.y - padding + 10))
                .attr("stroke", "gray")
                .attr("stroke-width", 1.5);
        });

    }, [events, isVertical, dynamicWidth]);

    return (
        <div>
            <div className="button-container">
                <button onClick={handleZoomIn}>Zoom In</button>
                <button onClick={handleZoomOut}>Zoom Out</button>
                <button onClick={handleZoomReset}>Reset Zoom</button>
            </div>
            <div style={{
                width: `${dynamicWidth}px`, // 브라우저 80% 크기 유지
                height: "600px", // 고정 높이 (필요시 조정)
                overflow: "auto", // 내부가 넘치면 스크롤 생성
                border: "1px solid #ccc",
                position: "relative"
            }}>
                <svg ref={svgRef}></svg>
            </div>
            {selectedEvent && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "white",
                    padding: "20px",
                    boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
                    zIndex: 1000,
                    minWidth: "300px",
                    textAlign: "center"
                }}>
                    <h2>{selectedEvent.createdt}</h2>
                    <p>{selectedEvent.title}</p>
                    <p>{selectedEvent.description}</p>
                    <button onClick={() => setSelectedEvent(null)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Timeline;
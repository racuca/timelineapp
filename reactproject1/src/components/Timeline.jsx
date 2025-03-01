import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { convertDateToStr, truncateText }  from "../parseUtils";
import Cookies from "js-cookie";


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
    const innerHeight = isVertical ? innerWidth : 550; 

    useEffect(() => {

        const handleResize = () => {
            console.log("window width change", window.innerWidth);
            setDynamicWidth(Math.max(baseWidth, window.innerWidth * 0.8));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {

        console.log("event length", events);

        const svg = d3.select(svgRef.current);
        const size = Math.max(baseWidth, events.length * baseEventSpacing + 100); // 타임라인 너비 계산
        const width = size;  // main line width
        const height = isVertical ? size : 600;
        console.log("size width height ", width, height, innerWidth, innerHeight);

        svg.attr("width", innerWidth) // 부모 div에 맞춤
            .attr("height", innerHeight)
            .style("background", "#f9f9f9");

        // Clear previous elements
        svg.selectAll("*").remove();

        // Append a group for zoomable content
        const g = svg.append("g");

        // Define zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 3]) // min x0.5, max x3 zoom
            .on("zoom", (event) => {
                g.attr("transform", event.transform); // 그룹 요소에 변환 적용
            });

        svg.call(zoom); // SVG에 줌 이벤트 연결
        zoomBehaviorRef.current = zoom;

        // Draw the timeline
        const linePos = isVertical ? width / 2 : height / 2;
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
                setSelectedEvent(d);
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
                .text(convertDateToStr(d.createdt)) // 첫 번째 줄 (날짜)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "0em")
                .style("font-weight", "bold");

            text.append("tspan")
                .text(d.title) // 두 번째 줄 (제목)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "1.5em")
                .style("font-weight", "bold");

            text.append("tspan")
                .text(truncateText(d.description, 15)) // 세 번째 줄 (설명)
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
            {/*<div className="button-right-container">                
                <button onClick={handleZoomIn}>Zoom In</button>
                <button onClick={handleZoomOut}>Zoom Out</button>
                <button onClick={handleZoomReset}>Reset Zoom</button>
            </div>*/}
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
                <div className="
                    fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-white p-6 shadow-lg z-50 min-w-[320px] max-w-[90%] rounded-xl text-center 
                    border-solid border-green-500
                ">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        {selectedEvent.createdt}
                    </h2>
                    <p className="text-lg font-bold text-gray-700 mb-2">
                        {selectedEvent.title}
                    </p>
                    <p className="text-base text-gray-600 leading-relaxed mb-4">
                        {selectedEvent.description}
                    </p>
                    <button
                        onClick={() => setSelectedEvent(null)}
                        className="
                        px-4 py-2 bg-blue-500 text-white rounded-lg 
                        shadow-md transition duration-300 hover:bg-blue-600 active:scale-95"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default Timeline;
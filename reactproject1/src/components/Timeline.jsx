import React, { useRef, useEffect } from "react";
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

    const baseWidth = 800; // 기본 타임라인 너비
    const baseEventSpacing = 200; // 이벤트 간 기본 간격

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const size = Math.max(baseWidth, events.length * baseEventSpacing + 100); // 타임라인 너비 계산
        const height = isVertical ? size : 400; // 세로 방향이면 높이를 늘림
        const width = isVertical ? 400 : size; // 가로 방향이면 너비를 늘림

        svg.attr("width", width).attr("height", height).style("background", "#f9f9f9");

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
            .attr("x2", isVertical ? linePos : width - 50)
            .attr("y1", isVertical ? 50 : linePos)
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
                    `translate(${isVertical ? linePos : 100 + i * baseEventSpacing}, ${isVertical ? 100 + i * baseEventSpacing : linePos - 20
                    })`
            );

        //eventGroups.append("circle")
        //    .attr("r", 10)
        //    .attr("fill", "steelblue");
        // Add branches
        eventGroups.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => (isVertical ? (i % 2 === 0 ? -50 : 50) : 0))
            .attr("y2", (d, i) => (isVertical ? 0 : (i % 2 === 0 ? -50 : 50)))
            .attr("stroke", "gray")
            .attr("stroke-width", 1.5);

        eventGroups.append("rect")
            .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -150 : 60) : -60))
            .attr("y", (d, i) => (isVertical ? -30 : i % 2 === 0 ? -90 : 10))
            .attr("width", 120)
            .attr("height", 60)
            .attr("rx", 8) // rounded corners
            .attr("ry", 8)
            .attr("fill", "white")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .style("box-shadow", "0px 4px 10px rgba(0, 0, 0, 0.1)");

        eventGroups.append("text")
            .text(d => d.createdt)
            .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -90 : 90) : 0))
            .attr("y", (d, i) => (isVertical ? -5 : i % 2 === 0 ? -65 : 35))
            .attr("text-anchor", "middle")
            .style("font-size", "12px");

        eventGroups.append("text")
            .text(d => d.description)
            .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -90 : 90) : 0))
            .attr("y", (d, i) => (isVertical ? -5 : i % 2 === 0 ? -45 : 50))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold");
    }, [events, isVertical]);

    return (
        <div>
            <div className="button-container">
                <button onClick={handleZoomIn}>Zoom In</button>
                <button onClick={handleZoomOut}>Zoom Out</button>
                <button onClick={handleZoomReset}>Reset Zoom</button>
            </div>
            <div
                ref={containerRef}
                style={{ width: "800px", overflowX: "scroll", border: "1px solid #ddd" }}
            >
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default Timeline;
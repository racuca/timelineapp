import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const Timeline = ({ svgRef, containerRef, zoomBehaviorRef, events, isVertical }) => {
    const handleZoomIn = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(zoomBehaviorRef.current.scaleBy, 1.2); // 1.2�� �� ��
    };

    const handleZoomOut = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(zoomBehaviorRef.current.scaleBy, 0.8); // 0.8�� �� �ƿ�
    };

    const handleZoomReset = () => {
        const svg = d3.select(svgRef.current);
        svg.transition().call(zoomBehaviorRef.current.transform, d3.zoomIdentity); // �ʱ� ���·� �� ����
    };

    const baseWidth = 800; // �⺻ Ÿ�Ӷ��� �ʺ�
    const baseEventSpacing = 200; // �̺�Ʈ �� �⺻ ����

    console.log("events.length ", events.length);
    console.log("events ", events);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const size = Math.max(baseWidth, events.length * baseEventSpacing + 100); // Ÿ�Ӷ��� �ʺ� ���
        const height = isVertical ? size : 400; // ���� �����̸� ���̸� �ø�
        const width = isVertical ? 400 : size; // ���� �����̸� �ʺ� �ø�

        svg.attr("width", width).attr("height", height).style("background", "#f9f9f9");

        // Clear previous elements
        svg.selectAll("*").remove();

        // Append a group for zoomable content
        const g = svg.append("g");

        // Define zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 3]) // �ּ� 0.5��, �ִ� 3�� ��
            .on("zoom", (event) => {
                g.attr("transform", event.transform); // �׷� ��ҿ� ��ȯ ����
            });

        svg.call(zoom); // SVG�� �� �̺�Ʈ ����
        zoomBehaviorRef.current = zoom;

        // Draw the timeline
        const linePos = isVertical ? width / 2 : height / 2; // ����/���� ���⿡ ���� �� ��ġ ����
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
            );

        // Add text and dynamically calculate box size
        const textElements = eventGroups.append("text")
            .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -90 : 100) : 0))
            .attr("y", (d, i) => (isVertical ? 20 : i % 2 === 0 ? -80 : 50))
            .attr("text-anchor", "left")
            .style("font-size", "12px");

        // �� �ٷ� �ؽ�Ʈ �߰�: ù ���� d.createdt, ��° ���� d.description
        textElements.each(function (d, i) {
            const text = d3.select(this);
            text.append("tspan")
                .text(d.createdt) // ù ��° �� (��¥)
                .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -200 : 0) : 0))
                .attr("dy", "0em")
                .style("font-weight", "bold"); // ��¥ ����

            text.append("tspan")
                .text(d.description) // �� ��° �� (����)
                .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -200 : 0) : 0))
                .attr("dy", "1.5em");
        });

        // �ڽ� �߰�
        textElements.each(function (d, i) {
            const bbox = this.getBBox(); // Get text size dynamically
            const padding = 20;

            // Add background rectangle for each text
            d3.select(this.parentNode)
                .insert("rect", "text")
                .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? bbox.x : 100) : bbox.x - 10))
                .attr("y", (d, i) => (isVertical ? (i % 2 === 0 ? bbox.y : 100) : bbox.y - 10))
                .attr("width", bbox.width + padding)
                .attr("height", bbox.height + padding)
                .attr("rx", 4)  // �𼭸� radius
                .attr("ry", 4)
                .attr("fill", "white")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .lower(); // Send rectangle to the back

            // Ÿ�Ӷ��ΰ� �ڽ��� �����ϴ� �� �߰�
            d3.select(this.parentNode)
                .append("line")
                .attr("x1", isVertical ? linePos : bbox.x)
                .attr("y1", isVertical ? 0 : 0)
                .attr("x2", isVertical ? (i % 2 === 0 ? linePos - 100 : linePos + 100) : bbox.x)
                .attr("y2", isVertical ? bbox.y : (i % 2 === 0 ? bbox.y + bbox.height + padding - 10: bbox.y - padding + 10))
                .attr("stroke", "gray")
                .attr("stroke-width", 1.5);
        });

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
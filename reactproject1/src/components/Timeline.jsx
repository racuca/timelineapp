import React, { useRef, useEffect, useState } from "react";
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
    const [selectedEvent, setSelectedEvent] = useState(null); // ���õ� �̺�Ʈ ����

    const baseWidth = 800; // �⺻ Ÿ�Ӷ��� �ʺ�
    const baseEventSpacing = 100; // �̺�Ʈ �� �⺻ ����
    const [dynamicWidth, setDynamicWidth] = useState(window.innerWidth * 0.8);

    // �̺�Ʈ ���� ��� ���� SVG ũ�� ���
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
        const size = Math.max(baseWidth, events.length * baseEventSpacing + 100); // Ÿ�Ӷ��� �ʺ� ���
        const width = isVertical ? dynamicWidth : size; // ���� �����̸� �ʺ� �ø�
        const height = isVertical ? size : 600; // ���� �����̸� ���̸� �ø�
        //console.log("useEffect", width, height);

        //svg.attr("width", width).attr("height", height).style("background", "#f9f9f9");
        svg.attr("width", innerWidth) // �θ� div�� ����
            .attr("height", innerHeight)
            .style("background", "#f9f9f9");

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
            
            ).on("click", (event, d) => {
                setSelectedEvent(d); // �ڽ��� Ŭ���ϸ� ���õ� �̺�Ʈ ����
            });

        // Add text and dynamically calculate box size
        const textElements = eventGroups.append("text")
            .attr("x", (d, i) => (isVertical ? (i % 2 === 0 ? -80 : 100) : 0))
            .attr("y", (d, i) => (isVertical ? 20 : i % 2 === 0 ? -80 : 50))
            .attr("text-anchor", "left")
            .style("font-size", "12px");

        // �� �ٷ� �ؽ�Ʈ �߰�: ù ���� d.createdt, ��° ���� d.description
        textElements.each(function (d, i) {
            const text = d3.select(this);
            text.append("tspan")
                .text(d.createdt) // ù ��° �� (��¥)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "0em")
                .style("font-weight", "bold");

            text.append("tspan")
                .text(d.title) // �� ��° �� (����)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "1.5em")
                .style("font-weight", "bold");

            text.append("tspan")
                .text(d.description) // �� ��° �� (����)
                .attr("x", isVertical ? (i % 2 === 0 ? -200 : 50) : 0)
                .attr("dy", "2em");
        });

        // �ڽ� �߰�
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
                .attr("rx", 4)  // �𼭸� radius
                .attr("ry", 4)
                .attr("fill", "white")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .on("click", (event, d) => {
                    setSelectedEvent(d); // �ڽ��� Ŭ���ϸ� �̺�Ʈ ���� ����
                })
                .style("cursor", "pointer")
                .lower(); // Send rectangle to the back

            // Ÿ�Ӷ��ΰ� �ڽ��� �����ϴ� �� �߰�
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
                width: `${dynamicWidth}px`, // ������ 80% ũ�� ����
                height: "600px", // ���� ���� (�ʿ�� ����)
                overflow: "auto", // ���ΰ� ��ġ�� ��ũ�� ����
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
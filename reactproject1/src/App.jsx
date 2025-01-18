import React, { useRef, useEffect, useState } from "react";
import Modal from "react-modal";
import * as d3 from "d3";
import "./App.css";

Modal.setAppElement("#root");

const App = () => {
    const [events, setEvents] = useState([
        { id: 1, date: "1900-01-01 00:00:00", description: "Start of 20th Century" },
        { id: 2, date: "1800-01-01 00:00:00", description: "Industrial Revolution" },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEventDate, setNewEventDate] = useState("");
    const [newEventDescription, setNewEventDescription] = useState("");
    const [year, setYear] = useState(2025);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);
    const [isBC, setIsBC] = useState(false);

    const svgRef = useRef();
    const containerRef = useRef(); // 스크롤 컨테이너 참조
    const zoomBehaviorRef = useRef();
    const baseWidth = 800; // 기본 타임라인 너비
    const baseEventSpacing = 200; // 이벤트 간 기본 간격

    useEffect(() => {
        // 시간순 정렬
        const parseDate = (date) => {
            if (date.startsWith("BC ")) {
                const parts = date.replace("BC ", "").split(/[- :]/); // "BC 0001-01-01 00:00:00" → ["0001", "01", "01", "00", "00", "00"]
                const bcYear = -parseInt(parts[0], 10) + 1; // BC 1년을 0으로 취급하기 위해 +1
                const month = parseInt(parts[1], 10) - 1; // 월은 0부터 시작
                const day = parseInt(parts[2], 10);
                const hours = parseInt(parts[3], 10);
                const minutes = parseInt(parts[4], 10);
                const seconds = parseInt(parts[5], 10);

                // 기원전 날짜를 유닉스 시간으로 계산
                const bcDate = new Date(Date.UTC(0, 0, 1, 0, 0, 0)); // 기준점: 0년 1월 1일
                bcDate.setUTCFullYear(bcYear); // 음수 연도를 수동 설정
                bcDate.setUTCMonth(month); // 월 설정
                bcDate.setUTCDate(day); // 일 설정
                bcDate.setUTCHours(hours, minutes, seconds, 0); // 시간 설정

                return bcDate.getTime(); // 유닉스 타임스탬프 반환
            }
            return new Date(date).getTime(); // 일반 날짜 처리
        };

        events.sort((a, b) => parseDate(a.date) - parseDate(b.date));

        const svg = d3.select(svgRef.current);
        const width = Math.max(baseWidth, events.length * baseEventSpacing + 100); // 타임라인 너비 계산
        const height = 400;

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
        const lineY = height / 2;
        g.append("line")
            .attr("x1", 50)
            .attr("x2", width - 50)
            .attr("y1", lineY)
            .attr("y2", lineY)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw events
        const eventGroups = g.selectAll(".event")
            .data(events)
            .enter()
            .append("g")
            .attr("class", "event")
            .attr("transform", (d, i) => `translate(${100 + i * baseEventSpacing}, ${lineY - 20})`);

        eventGroups.append("circle")
            .attr("r", 10)
            .attr("fill", "steelblue");

        eventGroups.append("text")
            .text(d => d.date)
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px");

        eventGroups.append("text")
            .text(d => d.description)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "12px");
    }, [events]);


    const handleAddEvent = () => {
        if (!newEventDescription.trim()) {
            alert("Please enter a description for the event.");
            return;
        }
        const formattedDate = `${isBC ? "BC " : ""}${year.toString().padStart(4, "0")}-${month
            .toString()
            .padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour
            .toString()
            .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second
            .toString()
            .padStart(2, "0")}`;

        const newEvent = {
            id: events.length + 1,
            date: formattedDate,
            description: newEventDescription,
        };

        setEvents((prevEvents) => {
            // 시간순 정렬
            const parseDate = (date) => {
                if (date.startsWith("BC ")) {
                    const parts = date.replace("BC ", "").split(/[- :]/); // "BC 0001-01-01 00:00:00" → ["0001", "01", "01", "00", "00", "00"]
                    const bcYear = -parseInt(parts[0], 10) + 1; // BC 1년을 0으로 취급하기 위해 +1
                    const month = parseInt(parts[1], 10) - 1; // 월은 0부터 시작
                    const day = parseInt(parts[2], 10);
                    const hours = parseInt(parts[3], 10);
                    const minutes = parseInt(parts[4], 10);
                    const seconds = parseInt(parts[5], 10);

                    // 기원전 날짜를 유닉스 시간으로 계산
                    const bcDate = new Date(Date.UTC(0, 0, 1, 0, 0, 0)); // 기준점: 0년 1월 1일
                    bcDate.setUTCFullYear(bcYear); // 음수 연도를 수동 설정
                    bcDate.setUTCMonth(month); // 월 설정
                    bcDate.setUTCDate(day); // 일 설정
                    bcDate.setUTCHours(hours, minutes, seconds, 0); // 시간 설정

                    return bcDate.getTime(); // 유닉스 타임스탬프 반환
                }
                return new Date(date).getTime(); // 일반 날짜 처리
            };

            const updatedEvents = [...prevEvents, newEvent].sort((a, b) => {
                console.log("sorted result:", parseDate(a.date) - parseDate(b.date)); 
                return parseDate(a.date) - parseDate(b.date)
            });
            console.log("sorted events:", updatedEvents); // 여기에서 정렬 결과를 확인
            return updatedEvents;           
        });

        // 타임라인 크기와 스크롤 조정
        setTimeout(() => {
            const container = containerRef.current;
            const svg = svgRef.current;
            if (container && svg) {
                container.scrollLeft = svg.scrollWidth;
            }
        }, 0);

        closeModal();
        // 입력값 초기화
        //setNewDate(new Date());
        setNewEventDescription("");
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleAdd = (type) => {
        switch (type) {
            case "year":
                setYear((prev) => (isBC && prev > 1 ? prev - 1 : prev + 1));
                break;
            case "month":
                setMonth((prev) => (prev < 12 ? prev + 1 : 1));
                break;
            case "day":
                setDay((prev) => (prev < 31 ? prev + 1 : 1));
                break;
            case "hour":
                setHour((prev) => (prev < 23 ? prev + 1 : 0));
                break;
            case "minute":
                setMinute((prev) => (prev < 59 ? prev + 1 : 0));
                break;
            case "second":
                setSecond((prev) => (prev < 59 ? prev + 1 : 0));
                break;
            default:
                break;
        }
    };

    const handleSubtract = (type) => {
        switch (type) {
            case "year":
                setYear((prev) => (isBC ? prev + 1 : Math.max(prev - 1, 0)));
                break;
            case "month":
                setMonth((prev) => (prev > 1 ? prev - 1 : 12));
                break;
            case "day":
                setDay((prev) => (prev > 1 ? prev - 1 : 31));
                break;
            case "hour":
                setHour((prev) => (prev > 0 ? prev - 1 : 23));
                break;
            case "minute":
                setMinute((prev) => (prev > 0 ? prev - 1 : 59));
                break;
            case "second":
                setSecond((prev) => (prev > 0 ? prev - 1 : 59));
                break;
            default:
                break;
        }
    };

    const handleToggleBC = () => setIsBC((prev) => !prev);


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

    return (
        <div>
            <h1>Timeline with Date Picker</h1>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={openModal}>Add Event</button>
            </div>
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
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Add Event"
                style={{
                    content: {
                        maxWidth: "400px",
                        margin: "auto",
                        padding: "20px",
                    },
                }}
            >
                <h2>Add Event</h2>
                <div>
                    <label>Year: </label>
                    <button onClick={() => handleSubtract("year")}>-</button>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    />
                    <button onClick={() => handleAdd("year")}>+</button>
                </div>
                <div>
                    <label>Month: </label>
                    <button onClick={() => handleSubtract("month")}>-</button>
                    <input
                        type="number"
                        value={month}
                        onChange={(e) => setMonth(Math.min(Math.max(Number(e.target.value), 1), 12))}
                    />
                    <button onClick={() => handleAdd("month")}>+</button>
                </div>
                <div>
                    <label>Day: </label>
                    <button onClick={() => handleSubtract("day")}>-</button>
                    <input
                        type="number"
                        value={day}
                        onChange={(e) => setDay(Math.min(Math.max(Number(e.target.value), 1), 31))}
                    />
                    <button onClick={() => handleAdd("day")}>+</button>
                </div>
                <div>
                    <label>Hour: </label>
                    <button onClick={() => handleSubtract("hour")}>-</button>
                    <input
                        type="number"
                        value={hour}
                        onChange={(e) => setHour(Math.min(Math.max(Number(e.target.value), 0), 23))}
                    />
                    <button onClick={() => handleAdd("hour")}>+</button>
                </div>
                <div>
                    <label>Minute: </label>
                    <button onClick={() => handleSubtract("minute")}>-</button>
                    <input
                        type="number"
                        value={minute}
                        onChange={(e) => setMinute(Math.min(Math.max(Number(e.target.value), 0), 59))}
                    />
                    <button onClick={() => handleAdd("minute")}>+</button>
                </div>
                <div>
                    <label>Second: </label>
                    <button onClick={() => handleSubtract("second")}>-</button>
                    <input
                        type="number"
                        value={second}
                        onChange={(e) => setSecond(Math.min(Math.max(Number(e.target.value), 0), 59))}
                    />
                    <button onClick={() => handleAdd("second")}>+</button>
                </div>
                <div>
                    <label>
                        <input type="checkbox" checked={isBC} onChange={handleToggleBC} /> BC
                    </label>
                </div>
                <div>
                    <label>Description: </label>
                    <input
                        type="text"
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        placeholder="Event description"
                    />
                </div>
                <button onClick={handleAddEvent}>Add Event</button>
                <button onClick={closeModal}>Cancel</button>
            </Modal>
        </div>
    );
};

export default App;
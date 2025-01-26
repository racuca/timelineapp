import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import * as d3 from "d3";
import { parseDate } from "./parseUtils";
import "./App.css";

Modal.setAppElement("#root");

const App = () => {
    const [events, setEvents] = useState([
        //{ id: 1, date: "0100-01-01 00:00:00", description: "test100", level:0 },
        //{ id: 2, date: "0-01-01 00:00:00", description: "Start of AC", level:0 },
        //{ id: 3, date: "BC 0100-01-01 00:00:00", description: "BC 100", level:0 },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState(""); 
    const [newEventDescription, setNewEventDescription] = useState("");
    const [newEventLevel, setNewEventLevel] = useState(0); // Default level: 0

    const [year, setYear] = useState(2025);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);
    const [isBC, setIsBC] = useState(false);

    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [passwd, setPasswd] = useState("");
    const [email, setEmail] = useState("");
        
    const [isVertical, setIsVertical] = useState(false); // 타임라인 방향 상태 추가

    const svgRef = useRef();
    const containerRef = useRef(); // 스크롤 컨테이너 참조
    const zoomBehaviorRef = useRef();
    const baseWidth = 800; // 기본 타임라인 너비
    const baseEventSpacing = 200; // 이벤트 간 기본 간격
    const serverurl = "http://localhost:5001";

    useEffect(() => {
        axios
            .get(serverurl + "/users")
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });

        axios
            .get(serverurl + "/events")
            .then((response) => {
                const sortedEvents = [...response.data].sort((a, b) => parseDate(a.createdt) - parseDate(b.createdt));
                if (JSON.stringify(events) !== JSON.stringify(sortedEvents)) {
                    setEvents(sortedEvents); // 정렬된 데이터 저장
                } 
            })
            .catch((error) => {
                console.error("Error fetching events:", error);
            });

        //events.sort((a, b) => parseDate(a.date) - parseDate(b.date));

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

        // Draw events
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

        eventGroups.append("circle")
            .attr("r", 10)
            .attr("fill", "steelblue");

        eventGroups.append("text")
            .text(d => d.createdt)
            .attr("y", isVertical ? 0 : -15)
            .attr("x", isVertical ? 20 : 0)
            .attr("text-anchor", "middle")
            .style("font-size", "12px");

        eventGroups.append("text")
            .text(d => d.description)
            .attr("y", isVertical ? 30 : 30)
            .attr("x", isVertical ? 20 : 0)
            .attr("text-anchor", "middle")
            .style("font-size", "12px");
    }, [events, isVertical, parseDate, serverurl]);

    // Add a new user
    const handleAddUser = () => {
        axios
            .post(serverurl + "/users", { name, passwd, email })
            .then((response) => {
                setUsers([...users, response.data]); // Add the new user to the list
                setName("");
                setPasswd("");
                setEmail("");
            })
            .catch((error) => {
                console.error("Error adding user:", error);
            });
    };

    const toggleDirection = () => setIsVertical((prev) => !prev); // 방향 전환 함수

    const handleAddEvent = () => {
        if (!newEventDescription.trim()) {
            alert("Please enter a description for the event.");
            return;
        }

        const formattedDate = `${isBC ? "BC " : ""}${year.toString().padStart(4, "0")}-${month
            .toString().padStart(2, "0")}-${day
            .toString().padStart(2, "0")} ${hour
            .toString().padStart(2, "0")}:${minute
            .toString().padStart(2, "0")}:${second
            .toString().padStart(2, "0")}`;

        const newEvent = {
            id: events.length + 1,
            createdt: formattedDate,
            title: newEventTitle,
            description: newEventDescription,
            level: newEventLevel || 0,
        };
        
        setEvents((prevEvents) => {
            const updatedEvents = [...prevEvents, newEvent].sort((a, b) => parseDate(a.createdt) - parseDate(b.createdt));
            return updatedEvents;
        });

        // save to database.
        axios
            .post(serverurl + "/events", { newEvent })
            .then((response) => {
                setEvents([...events, response.data]);
                setNewEventTitle("");
                setNewEventDescription("");
                setNewEventLevel(0);
            })
            .catch((error) => {
                console.error("Error adding history:", error);
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
            <h1>Timeline History</h1>
            <div style={{ padding: "20px" }}>
                <h1>User List</h1>
                <ul>
                    {users.map((user) => (
                        <li key={user.id}>
                            {user.name} - {user.email}
                        </li>
                    ))}
                </ul>
                <h2>Add User</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="password"
                    placeholder=""
                    value={passwd}
                    onChange={(e) => setPasswd(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleAddUser}>Add User</button>
            </div>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={toggleDirection}>
                    Switch to {isVertical ? "Horizontal" : "Vertical"} Timeline
                </button>
            </div>
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
                    <label>Title: </label>
                    <input
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Title"
                    />
                </div>
                <div>
                    <label>Description: </label>
                    <input
                        type="text"
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        placeholder="description"
                    />
                </div>
                <div>
                    <label>Level: </label>
                    <select
                        value={newEventLevel}
                        onChange={(e) => setNewEventLevel(Number(e.target.value))}
                    >
                        {[...Array(11).keys()].map((level) => (
                            <option key={level} value={level}>
                                Level {level}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={handleAddEvent}>Add Event</button>
                <button onClick={closeModal}>Cancel</button>
            </Modal>
        </div>
    );
};

export default App;
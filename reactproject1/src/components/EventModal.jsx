import React, { useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { parseDate } from "../parseUtils";


const EventModal = ({ isModalOpen, closeModal, events, setEvents, serverurl, containerRef, svgRef }) => {
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
            userid: 1
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

    const handleToggleBC = () => setIsBC((prev) => !prev);

    return (
        <div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Add Event"
                style={{
                    content: {
                        maxWidth: "480px",
                        margin: "auto",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    },
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Add Event</h2>
                {/* 날짜 입력 필드 */}
                <div style={{ display: "grid", gap: "10px" }}>
                    {[
                        { label: "Year", value: year, setValue: setYear, min: -9999, max: 9999 },
                        { label: "Month", value: month, setValue: setMonth, min: 1, max: 12 },
                        { label: "Day", value: day, setValue: setDay, min: 1, max: 31 },
                        { label: "Hour", value: hour, setValue: setHour, min: 0, max: 23 },
                        { label: "Minute", value: minute, setValue: setMinute, min: 0, max: 59 },
                        { label: "Second", value: second, setValue: setSecond, min: 0, max: 59 },
                    ].map(({ label, value, setValue, min, max }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <label style={{ width: "80px" }}>{label}:</label>
                            <button
                                onClick={() => setValue(Math.max(value - 1, min))}
                                style={{ padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(Math.min(Math.max(Number(e.target.value), min), max))}
                                style={{
                                    width: "60px",
                                    textAlign: "center",
                                    padding: "5px",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc",
                                }}
                            />
                            <button
                                onClick={() => setValue(Math.min(value + 1, max))}
                                style={{ padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}
                            >
                                +
                            </button>
                        </div>
                    ))}
                </div>

                {/* BC 체크박스 */}
                <div style={{ margin: "10px 0" }}>
                    <label>
                        <input type="checkbox" checked={isBC} onChange={handleToggleBC} /> BC
                    </label>
                </div>

                {/* 제목 입력 */}
                <div style={{ marginBottom: "10px" }}>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Enter title"
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                {/* 설명 입력 */}
                <div style={{ marginBottom: "10px" }}>
                    <label>Description:</label>
                    <textarea
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        placeholder="Enter description"
                        rows={4}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            resize: "vertical",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                {/* 레벨 선택 */}
                <div style={{ marginBottom: "20px" }}>
                    <label>Level:</label>
                    <select
                        value={newEventLevel}
                        onChange={(e) => setNewEventLevel(Number(e.target.value))}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box",
                        }}
                    >
                        {[...Array(11).keys()].map((level) => (
                            <option key={level} value={level}>
                                Level {level}
                            </option>
                        ))}
                    </select>
                </div>
                {/* 버튼 그룹 */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                        onClick={handleAddEvent}
                        style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "5px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            marginRight: "10px",
                        }}
                    >
                        Add Event
                    </button>
                    <button
                        onClick={closeModal}
                        style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "5px",
                            backgroundColor: "#ccc",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>                
            </Modal>
        </div>
    );
};

export default EventModal;
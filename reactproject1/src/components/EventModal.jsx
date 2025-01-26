import React, { useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { parseDate } from "../parseUtils";


const EventModal = ({ isModalOpen, closeModal, openModal, events, setEvents, serverurl }) => {
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

    return (
        <div>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={openModal}>Add Event</button>
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

export default EventModal;
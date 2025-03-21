import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import { parseDate } from "../parseUtils";
import Cookies from "js-cookie";

const EventModal = ({ isModalOpen, closeModal, events, setEvents, serverurl, containerRef, svgRef}) => {
    
    const [newEventTitle, setNewEventTitle] = useState(""); 
    const [newEventDescription, setNewEventDescription] = useState("");
    const [newEventLevel, setNewEventLevel] = useState(0); // Default level: 0
    const [newEventCategory, setNewEventCategory] = useState(0); // Default category: 0
    const [newEventCountry, setNewEventCountry] = useState(0); // Default country: 0
    const [year, setYear] = useState(0);
    const [month, setMonth] = useState(0);
    const [day, setDay] = useState(0);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);
    const [isBC, setIsBC] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null); // To track logged-in user

    useEffect(() => {
        const storedUser = Cookies.get("user");
        //console.log(storedUser);
        if (storedUser) {
            setLoggedInUser(JSON.parse(storedUser));
        }
        const now = new Date();
        setYear(now.getFullYear());
        setMonth(now.getMonth() + 1);
        setDay(now.getDate());
        setHour(now.getHours());
        setMinute(now.getMinutes());
        setSecond(now.getSeconds());
    }, [isModalOpen]); // 빈 배열을 넣어 처음 렌더링 시 한 번만 실행


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
            //id: events.length + 1,
            createdt: formattedDate,
            title: newEventTitle,
            description: newEventDescription,
            level: newEventLevel || 0,
            category: newEventCategory, 
            userid: loggedInUser.id,
            country: newEventCountry
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
                setNewEventCountry(0);
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
    const categoryData = {
        0: "개인사", 1: "정치사회", 2: "경제", 3: "문화예술",
        4: "인물", 5: "과학기술", 6: "전쟁", 7: "스포츠",
        8: "철학사상", 9: "종교", 10: "자연재해환경"
    };

    const countryData = {
        0: "전세계", 1: "대한민국", 2: "중국", 3: "아메리카", 4: "유럽", 5: "아시아",
        6:"아프리카", 7:"북극", 8:"남극"
    };

    const [tooltip, setTooltip] = useState({ isOpen: false, x: 0, y: 0 });
    const buttonRef = useRef(null);
    const toggleTooltip = () => {
        if (tooltip.isOpen) {
            setTooltip({ ...tooltip, isOpen: false });
        } else if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setTooltip({
                isOpen: true,
                x: rect.left + rect.width / 2, // 버튼 중앙 정렬
                y: rect.top + rect.height + window.scrollY + 8, // 버튼 아래 여유 공간 추가
            });
        }
    };


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
                        marginBottom: "0px",                        
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
                    <div className="relative flex items-center space-x-2">
                        <label>Level</label>
                        {/* "?" 버튼 */}
                        <button
                            ref={buttonRef}
                            onClick={toggleTooltip}
                            className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-sm font-bold hover:bg-gray-400"
                        >
                            ?
                        </button>
                    </div>
                    {/* 팝업 설명 박스 */}
                    {tooltip.isOpen && (
                        <div className="absolute left-10 top-0 w-64 bg-white shadow-md border border-gray-200 p-3 rounded-lg z-10"
                            style={{
                                top: `${tooltip.y - 50}px`,
                                left: `${tooltip.x - 550}px`, // 팝업을 버튼 중앙에 맞추기
                                transform: "translateX(-50%)", // 가운데 정렬
                            }}
                        >
                            <p className="text-sm text-gray-700">
                                Level은 역사적 중요도를 3단계로 표시하는데 값이 작을수록 중요한 역사적 사건입니다. 
                            </p>
                            <button
                                onClick={toggleTooltip}
                                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 rounded-md shadow transition"
                            >
                                닫기
                            </button>
                        </div>
                    )}
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
                        {[...Array(3).keys()].map((level) => (
                            <option key={level} value={level}>
                                Level {level}
                            </option>
                        ))}
                    </select>
                </div>
                {/* 카테고리 선택 */}
                <div style={{ marginBottom: "20px" }}>
                    <label>Category:</label>
                    <select
                        value={newEventCategory}
                        onChange={(e) => setNewEventCategory(Number(e.target.value))}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box",
                        }}
                    >
                        {[...Array(8).keys()].map((c) => (
                            <option key={c} value={c}>
                                {categoryData[c]}
                            </option>
                        ))}
                    </select>
                </div>
                {/* 나라 선택 */}
                <div style={{ marginBottom: "20px" }}>
                    <label>Country:</label>
                    <select
                        value={newEventCountry}
                        onChange={(e) => setNewEventCountry(Number(e.target.value))}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box",
                        }}
                    >
                        {[...Array(9).keys()].map((c) => (
                            <option key={c} value={c}>
                                {countryData[c]}
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
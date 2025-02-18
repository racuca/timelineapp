import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import Cookies from "js-cookie";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { parseDate } from "./parseUtils";
import Timeline from "./components/Timeline";
import EventModal from "./components/EventModal";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import AdminPage from "./admin/AdminPage"
import UserInfoPage from "./UserInfoPage";
import "./App.css";

// npm install 
// react - modal react-router-dom js-cookie


Modal.setAppElement("#root");

const App = () => {
    const [events, setEvents] = useState([
        //{ id: 1, date: "0100-01-01 00:00:00", description: "test100", level:0 },
        //{ id: 2, date: "0-01-01 00:00:00", description: "Start of AC", level:0 },
        //{ id: 3, date: "BC 0100-01-01 00:00:00", description: "BC 100", level:0 },
    ]);

    const [loggedInUser, setLoggedInUser] = useState(null); // To track logged-in user
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVertical, setIsVertical] = useState(false); // 타임라인 방향 상태 추가

    const svgRef = useRef();
    const containerRef = useRef(); // 스크롤 컨테이너 참조
    const zoomBehaviorRef = useRef();
    const serverurl = "http://localhost:5001";
    const navigate = useNavigate(); // To handle navigation

    const [selectedCategory, setSelectedCategory] = useState([0]);
    const categories = ["개인사", "정치사회", "경제", "예술", "인물", "교육"];
    const toggleSelection = (index) => {
        setSelectedCategory((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };
    const selectCategory = () => {
        console.log("Selected categories (indexes):", selectedCategory);
        Cookies.set("usercategory", selectedCategory, { expires: 30 });
    };

    useEffect(() => {
        const storedUser = Cookies.get("user");        
        console.log(storedUser);
        if (storedUser) {
            setLoggedInUser(JSON.parse(storedUser));            
        }

    }, []);
    
    useEffect(() => {
        const storedUser = Cookies.get("user");
        let userobj = undefined;
        if (storedUser) {
            userobj = JSON.parse(storedUser);
        }

        axios
            .get(serverurl + "/events", {
                params: { userid: userobj ? userobj["id"] : "null" }
            })
            .then((response) => {
                const sortedEvents = [...response.data].sort((a, b) => parseDate(a.createdt) - parseDate(b.createdt));
                if (JSON.stringify(events) !== JSON.stringify(sortedEvents)) {
                    setEvents(sortedEvents); // 정렬된 데이터 저장
                }
            })
            .catch((error) => {
                console.error("Error fetching events:", error);
            });

        const userCategory = Cookies.get("usercategory");
        if (userCategory) {
            setSelectedCategory(userCategory);
        }
        else {
            // server query
        }
    }, [events, loggedInUser]); // event 와 user login 변화 시 실행
    

    const toggleDirection = () => setIsVertical((prev) => !prev); // 방향 전환 함수
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleLogout = () => {
        Cookies.remove("user");
        setLoggedInUser(null); // Clear user data
        navigate("/"); // Redirect to home page after logout
    };



    return (
        <Routes>
            {/* Main Page */}
            <Route
                path="/"
                element={
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
                            <h1>Timeline History</h1>
                            <div style={{ alignSelf: "center" }}>
                                {loggedInUser ? (
                                    <div>
                                        {/* 사용자 이름을 클릭하면 userinfo 페이지로 이동 */}
                                        <Link
                                            to="/userinfo"
                                            state={{ user: loggedInUser }}
                                            style={{ cursor: "pointer", textDecoration: "underline", color: "blue", marginRight: "10px" }}
                                        >
                                            <span>{loggedInUser.name}</span>
                                        </Link>                                        
                                        {loggedInUser.usergrade === 1004 && (
                                            <Link to="/admin">
                                                <button>Admin Page</button>
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <Link to="/login">
                                            <button>Login</button>
                                        </Link>
                                        <Link to="/signup">
                                            <button style={{ marginLeft: "10px" }}>Sign Up</button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ margin: "10px" }}>
                            <button style={{ margin: "10px" }} onClick={toggleDirection}>
                                Switch to {isVertical ? "Horizontal" : "Vertical"} Timeline
                            </button>
                            <button style={{ margin: "10px" }} onClick={openModal}>
                                Add Event
                            </button>
                        </div>
                        <div className="flex flex-col items-center space-y-6 p-6">
                            <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">Select Categories</h2>
                                <div className="flex space-x-4 overflow-x-auto p-2">
                                    {categories.map((category, index) => (
                                        <label
                                            key={index}
                                            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCategory.includes(index)}
                                                onChange={() => toggleSelection(index)}
                                                className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring focus:ring-blue-300"
                                            />
                                            <span className="text-gray-800">{category}</span>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    onClick={selectCategory}
                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow transition"
                                >
                                    Select Category
                                </button>
                            </div>
                        </div>
                        <Timeline svgRef={svgRef} containerRef={containerRef} zoomBehaviorRef={zoomBehaviorRef} events={events} isVertical={isVertical} />
                        <EventModal isModalOpen={isModalOpen} closeModal={closeModal} events={events} setEvents={setEvents} serverurl={serverurl} containerRef={containerRef} svgRef={svgRef} />                        
                    </div>
                }
            />

            {/* Login Page */}
            <Route path="/login" element={<LoginPage serverurl={serverurl} setLoggedInUser={setLoggedInUser} />} />
            {/* Signup Page */}
            <Route path="/signup" element={<SignUpPage serverurl={serverurl} />} />
            {/* Admin Panel Route */}
            <Route path="/admin/*" element={<AdminPage serverurl={serverurl} />} />
            {/* User Info Page 추가 */}
            <Route path="/userinfo" element={<UserInfoPage />} />
        </Routes>
    );
};

export default App;
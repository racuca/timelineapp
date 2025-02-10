import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboard = ({ serverurl }) => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);
    const [latestEvents, setLatestEvents] = useState([]);

    console.log("AdminDashboard", serverurl);
    useEffect(() => {
        axios.get(serverurl + "/admin/stats")
            .then((response) => {
                console.log("Dashboard Data:", response.data);
                setTotalUsers(response.data[0].totalUsers);
                setTotalEvents(response.data[1].totalEvents);
                setLatestEvents(response.data[2].latestEvents);
            })
            .catch(error => {
                console.error("Error fetching dashboard stats:", error);
            });
    }, []);

    return (
        <div className="dashboard-container">
            {/* 상단 카드 영역 */}
            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <h3>총 사용자</h3>
                    <p>{totalUsers} 명</p>
                </div>
                <div className="dashboard-card">
                    <h3>총 이벤트</h3>
                    <p>{totalEvents} 개</p>
                </div>
            </div>

            {/* 최근 추가된 이벤트 목록 */}
            <div className="recent-events">
                <h2>최근 추가된 이벤트</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>                            
                            <th>날짜</th>
                            <th>제목</th>
                            <th>설명</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestEvents.map(event => (
                            <tr key={event.id}>
                                <td>{event.id}</td>
                                <td>{event.createdt}</td>
                                <td>{event.title}</td>
                                <td>{event.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
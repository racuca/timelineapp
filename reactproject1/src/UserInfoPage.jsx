// UserInfoPage.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const UserInfoPage = () => {
    const location = useLocation();
    const user = location.state?.user || {};
    const [tokenCount, setTokenCount] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);
    const serverurl = "http://localhost:5001"; // 서버 주소

    useEffect(() => {
        if (user.id) {
            // 1. Token 데이터 가져오기
            axios.get(`${serverurl}/user/${user.id}/tokens`)
                .then(response => setTokenCount(response.data.tokens))
                .catch(error => console.error("Error fetching tokens:", error));

            // 2. 최근 이벤트 가져오기
            axios.get(`${serverurl}/user/${user.id}/events`)
                .then(response => setRecentEvents(response.data))
                .catch(error => console.error("Error fetching events:", error));
        }
    }, [user.id]);

    const handleReceiveToken = () => {
        axios.post(`${serverurl}/user/${user.id}/receive-token`)
            .then(response => {
                setTokenCount(response.data.newTokenCount);
                alert("토큰을 받았습니다!");
            })
            .catch(error => console.error("Error receiving token:", error));
    };

    return (
        <div style={styles.container}>
            {/* 프로필 정보 */}
            <div style={styles.card}>
                <h2>👤 User Profile</h2>
                <p><strong>id:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Grade:</strong> {user.usergrade}</p>
                <p><strong>signupdt:</strong> {user.signupdt}</p>
                <p><strong>agreemarketing:</strong> {user.agreemarketing}</p>
            </div>

            {/* Token 정보 */}
            <div style={styles.card}>
                <h2>💰 Token Info</h2>
                <p><strong>보유 토큰:</strong> {tokenCount}</p>
                <button style={styles.button} onClick={handleReceiveToken}>토큰 받기</button>
            </div>

            {/* 최근 이벤트 */}
            <div style={styles.card}>
                <h2>📝 Recent Events</h2>
                <div style={styles.eventList}>
                    {recentEvents.length > 0 ? (
                        recentEvents.map((event) => (
                            <div key={event.id} style={styles.eventItem}>
                                <p><strong>{event.title}</strong></p>
                                <p>{event.description}</p>
                                <p><small>{event.date}</small></p>
                            </div>
                        ))
                    ) : (
                        <p>최근 올린 이벤트가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// 스타일 정의
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
    },
    card: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        width: "100%",
    },
    button: {
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "10px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "10px",
    },
    eventList: {
        maxHeight: "200px",
        overflowY: "auto",
    },
    eventItem: {
        padding: "10px",
        borderBottom: "1px solid #ddd",
    }
};


export default UserInfoPage;
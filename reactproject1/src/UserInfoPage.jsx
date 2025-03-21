// UserInfoPage.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { formatKoreanDateTime } from "./parseUtils";

const UserInfoPage = () => {
    const location = useLocation();
    const user = location.state?.user || {};
    const [tokenCount, setTokenCount] = useState(0);
    const [recentEvents, setRecentEvents] = useState({});
    const serverurl = "http://localhost:5001"; // 서버 주소

    useEffect(() => {
        if (user.id != undefined) {
            // 2. 최근 이벤트 가져오기
            axios.get(`${serverurl}/user/events/${user.id}`)
                .then(response => {
                    setRecentEvents(response.data)
                })
                .catch(error => console.error("Error fetching user event:", error));
        }
    }, [user.id]);

    const handleReceiveToken = () => {
        axios.post(`${serverurl}/user/gettoken/${user.id}`)
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
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>등급:</strong> {user.usergrade}</p>
                <p><strong>가입일자:</strong> {formatKoreanDateTime(user.signupdt)}</p>
                <p><strong>마케팅정보동의:</strong> {user.agreemarketing ? "여" : "부"}</p>
            </div>

            {/* 최근 이벤트 */}
            <div style={styles.card}>
                <h2>📝 My Events</h2>
                <div style={styles.eventList}>
                    {recentEvents ? (
                        <div key={recentEvents.id} style={styles.eventItem}>
                            <p><strong>{recentEvents.createdt}</strong></p>
                            <p><strong>{recentEvents.title}</strong></p>
                            <p>{recentEvents.description}</p>
                        </div>
                    ) : (
                        <p>최근 올린 이벤트가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* Token 정보 */}
            <div style={styles.card}>
                <h2>💰 Token Info</h2>
                <p><strong>보유 토큰:</strong> {tokenCount}</p>
                <button style={styles.button} onClick={handleReceiveToken}>토큰 받기</button>
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
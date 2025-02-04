import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Import the CSS for styling

const LoginPage = ({ serverurl, setLoggedInUser }) => {
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();    

    const handleLogin = () => {
        axios.post(serverurl + "/login", { email, passwd })
            .then((response) => {
                setLoggedInUser(response.data); // 로그인 정보 저장
                navigate("/"); // 메인 페이지로 이동
            })
            .catch((error) => {
                setError("로그인 실패: 이메일 또는 비밀번호가 틀렸습니다.");
                console.error("Login error:", error);
            });
    };

    return (
        /*<div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={passwd} onChange={(e) => setPasswd(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>*/
        <div className="login-container">
            <div className="login-form">
                <h2 className="login-title">Login</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoFocus
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={passwd}
                        onChange={(e) => setPasswd(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button className="login-button" onClick={handleLogin}>
                    Log In
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
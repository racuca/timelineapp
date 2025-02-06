import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./LoginPage.css"; // Import the CSS for styling

const LoginPage = ({ serverurl, setLoggedInUser }) => {
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();    

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // 쿠키 포함 요청
            const response = await axios.post(serverurl + "/login",
                { email, passwd },
                {
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        "Accept": "application/json",
                    },
                    withCredentials: true,
                    validateStatus: () => true
                });
            console.log(response);
            if (response.status == 200 && response.data.success == true) {
                console.log("login success", response.data);
                Cookies.set("user", JSON.stringify(response.data), { expires: 7 });
                setLoggedInUser(response.data); // 로그인 성공 시 상태 업데이트
                navigate("/"); // 홈으로 이동
            }
            else {
                setError(response.data.message);
            }

        } catch (error) {
            setError("서버 오류가 발생했습니다. 잠시후 다시 시도해 주세요.");
            console.error("❌ 로그인 에러:", error);
        }
    };

    return (
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
                {error && <p style={{ color: "red" }}>{error}</p>}                
            </div>
        </div>
    );
};

export default LoginPage;
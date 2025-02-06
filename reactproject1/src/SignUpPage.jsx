import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUpPage = ({ serverurl }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    console.log(serverurl);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${serverurl}/register`, { name, email, password });

            alert("회원가입 성공! 로그인 해주세요.");
            navigate("/login"); // 로그인 페이지로 이동
        } catch (error) {
            setError("회원가입 실패: 이미 존재하는 이메일이거나 오류가 발생했습니다.");
            console.error("❌ 회원가입 에러:", error);
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSignUp}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUpPage;
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ serverurl, setLoggedInUser }) => {
    const [email, setEmail] = useState("");
    const [passwd, setPasswd] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();    

    const handleLogin = () => {
        axios.post(serverurl + "/login", { email, passwd })
            .then((response) => {
                setLoggedInUser(response.data); // �α��� ���� ����
                navigate("/"); // ���� �������� �̵�
            })
            .catch((error) => {
                setError("�α��� ����: �̸��� �Ǵ� ��й�ȣ�� Ʋ�Ƚ��ϴ�.");
                console.error("Login error:", error);
            });
    };

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={passwd} onChange={(e) => setPasswd(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default LoginPage;
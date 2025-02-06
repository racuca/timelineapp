import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUpPage = ({ serverurl }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!agreeTerms || !agreePrivacy) {
            setError("필수 약관에 동의해야 회원가입이 가능합니다.");
            return;
        }
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
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>회원가입</h2>

            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                    <span onClick={() => setShowTerms(true)} style={{ textDecoration: "underline", cursor: "pointer" }}>
                        [필수] 서비스 이용약관 동의
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
                    <span onClick={() => setShowTerms(true)} style={{ textDecoration: "underline", cursor: "pointer" }}>
                        [필수] 개인정보 수집 및 이용 동의
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
                    <span onClick={() => setShowTerms(true)} style={{ textDecoration: "underline", cursor: "pointer" }}>
                        [선택] 마케팅 정보 수신 동의
                    </span>
                </div>

                <button type="submit" style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}>
                    회원가입
                </button>
            </form>

            {/* 약관 모달 */}
            {showTerms && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto" }}>
                        <h3>서비스 이용약관</h3>
                        <p>본 서비스는 사용자에게 다양한 온라인 서비스를 제공합니다...</p>
                        <h3>개인정보 수집 및 이용</h3>
                        <p>회사는 회원가입 및 서비스 이용을 위해 아래와 같은 개인정보를 수집합니다...</p>
                        <h3>마케팅 정보 수신 동의</h3>
                        <p>마케팅 정보 수신 동의를 선택하시면, 이벤트 및 프로모션 정보를 받을 수 있습니다.</p>
                        <button onClick={() => setShowTerms(false)} style={{ padding: "10px", marginTop: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignUpPage;
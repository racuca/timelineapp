import Cookies from "js-cookie";

// ��Ű(HttpOnly + Secure ���)
export const getAuthToken = () => {
    return Cookies.get("authToken");
};

export const removeAuthToken = () => {
    Cookies.remove("authToken");
};
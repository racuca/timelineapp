import Cookies from "js-cookie";

// ÄíÅ°(HttpOnly + Secure »ç¿ë)
export const getAuthToken = () => {
    return Cookies.get("authToken");
};

export const removeAuthToken = () => {
    Cookies.remove("authToken");
};
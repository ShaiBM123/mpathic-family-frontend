import { useNavigate } from "react-router-dom";

export const useLogOut = () => {
    const navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem("UserJWT");
        [
            "UserJWT",
            "userData",
            "RegUserData"
        ].forEach((key) => {
            sessionStorage.removeItem(key);
        });
        navigate("/");
    };

    return logOut; // Return the logout function
};
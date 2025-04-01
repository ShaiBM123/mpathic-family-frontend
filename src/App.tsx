// import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
// import EnterCode from "./pages/EnterCode";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import ChatPage from "./pages/ChatPage";
import SaveCookies from "./pages/SaveCookies";

function App() {

    return (
        <>
            <BrowserRouter basename={"/"}>
                <Routes>
                    <Route path="/" element={<SignUp />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/save-cookies" element={<SaveCookies />} />
                    <Route path="*" element={<SignUp />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;

// import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
// import EnterCode from "./pages/EnterCode";
import ChatPage from "./pages/ChatPage";

function App() {

    return (
        <>
            <BrowserRouter basename={"/"}>
                <Routes>
                    <Route path="/" element={<SignUp />} />
                    <Route path="/chat" element={<ChatPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;

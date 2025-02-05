// import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import ChatPage from "./pages/ChatPage";

function App() {

    return (
        <>
            <BrowserRouter basename={"/"}>
                <Routes>
                    <Route path="/" element={<ChatPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;

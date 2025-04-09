
// import "bootstrap/dist/css/bootstrap.min.css";
// import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '../chat/themes/main.scss';
import { useEffect } from "react";
import { ExtendedStorage } from "../data/ExtendedStorage";
import { ExtendedChatProvider } from '../chat/ExtendedChatProvider';
import {
    // BasicStorage,
    ChatMessage,
    IStorage,
    MessageContentType,
    // Presence,
    UpdateState,
    User,
    // UserStatus
} from "@chatscope/use-chat";
import { ChatService } from "../chat/ChatService";
import { Chat } from "../chat/Chat";
import { nanoid } from "nanoid";
// import { Col, Container, Row } from "react-bootstrap";
import { AutoDraft } from "@chatscope/use-chat/dist/enums/AutoDraft";
import { useNavigate } from "react-router-dom";

// sendMessage and addMessage methods can automagically generate id for messages and groups
// This allows you to omit doing this manually, but you need to provide a message generator
// The message id generator is a function that receives message and returns id for this message
// The group id generator is a function that returns string
const messageIdGenerator = (message: ChatMessage<MessageContentType>) => nanoid();
const groupIdGenerator = () => nanoid();

// Create serviceFactory
const serviceFactory = (storage: IStorage, updateState: UpdateState) => {
    return new ChatService(storage, updateState);
};


const userStorage = new ExtendedStorage({ groupIdGenerator, messageIdGenerator });

const ChatPage = () => {
    const navigate = useNavigate();
    const JWToken = JSON.parse(sessionStorage.getItem("UserJWT") as string);
    const userData = JSON.parse(sessionStorage.getItem("userData") as string);

    useEffect(() => {
        if (JWToken === null) {
            navigate("/");
        }
        [].forEach((key) => {
            sessionStorage.removeItem(key);
        });
    }, [JWToken, navigate]);

    const user = new User({
        id: userData.username,
        firstName: userData.first_name,
        username: userData.username,
        email: userData.email,
        data: {}
    });

    return (
        <div className="mpathic-app h-100 d-flex flex-column overflow-hidden">
            <div className="container-fluid flex-grow-1 position-relative overflow-hidden">
                <div className="row h-100 flex-nowrap">
                    <div className="col">
                        <ExtendedChatProvider serviceFactory={serviceFactory} storage={userStorage} config={{
                            typingThrottleTime: 250,
                            typingDebounceTime: 900,
                            debounceTyping: true,
                            autoDraft: AutoDraft.Save | AutoDraft.Restore
                        }}>
                            <Chat user={user} />
                        </ExtendedChatProvider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
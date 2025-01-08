// import './App.css';
import './themes/default/main.scss';
import "bootstrap/dist/css/bootstrap.min.css";
// import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import { ExtendedStorage } from "./data/ExtendedStorage";
import { ExtendedChatProvider } from './ExtendedChatProvider';
import {
    // BasicStorage,
    ChatMessage,
    IStorage,
    MessageContentType,
    Presence,
    UpdateState,
    User,
    UserStatus
} from "@chatscope/use-chat";
import { ChatService } from "./ChatService";
import { Chat } from "./components/Chat";
import { nanoid } from "nanoid";
import { Col, Container, Row } from "react-bootstrap";
import { userModel } from "./data/data";
import { AutoDraft } from "@chatscope/use-chat/dist/enums/AutoDraft";

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

const user = new User({
    id: "972-50-7632123", // should be the phone number
    presence: new Presence({ status: UserStatus.Available, description: "" }),
    firstName: "שי",
    lastName: "בן מיכאל",
    username: userModel.name,
    email: "shaibenmichael@gmail.com",
    avatar: userModel.avatar,
    bio: "CTO and Co-Founder at Mpathic",
    data: userModel
});

const userStorage = new ExtendedStorage({ groupIdGenerator, messageIdGenerator });

function App() {

    return (
        <div className="mpathic-app h-100 d-flex flex-column overflow-hidden">
            <Container fluid className="p-4 flex-grow-1 position-relative overflow-hidden">
                <Row className="h-100 pt-2 flex-nowrap">
                    <Col>
                        <ExtendedChatProvider serviceFactory={serviceFactory} storage={userStorage} config={{
                            typingThrottleTime: 250,
                            typingDebounceTime: 900,
                            debounceTyping: true,
                            autoDraft: AutoDraft.Save | AutoDraft.Restore
                        }}>
                            <Chat user={user} />
                        </ExtendedChatProvider>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;

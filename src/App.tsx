// import './App.css';
import './themes/default/main.scss';
import "bootstrap/dist/css/bootstrap.min.css";
// import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';

import { useState } from 'react';
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
import { Gender, avatars } from "./data/data";
import { AutoDraft } from "@chatscope/use-chat/dist/enums/AutoDraft";

import { UserForm } from "./components/user-form/UserForm";
import { TermsAndConditions } from "./components/website-terms-and-conditions/TermsAndConditions";
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
    id: "000-00-0000000", // should be the phone number
});


const userStorage = new ExtendedStorage({ groupIdGenerator, messageIdGenerator });

function App() {
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

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
                            {termsAccepted ?
                                <Chat user={user} /> :
                                <TermsAndConditions onAccept={(accepted) => {
                                    setTermsAccepted(accepted)
                                }} />
                            }
                        </ExtendedChatProvider>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;

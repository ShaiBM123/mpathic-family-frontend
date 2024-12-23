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
    // ChatProvider,
    Conversation,
    ConversationId,
    ConversationRole,
    IStorage,
    MessageContentType,
    Participant,
    Presence,
    TypingUsersList,
    UpdateState,
    User,
    UserStatus
} from "@chatscope/use-chat";
import { ChatService } from "./ChatService";
import { Chat } from "./components/Chat";
import { nanoid } from "nanoid";
import { Col, Container, Row } from "react-bootstrap";
import { userModel, openAIModel, openAIConversationId } from "./data/data";
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

function createConversation(id: ConversationId, name: string): Conversation {
    return new Conversation({
        id,
        participants: [
            new Participant({
                id: name,
                role: new ConversationRole([])
            })
        ],
        unreadCounter: 0,
        typingUsers: new TypingUsersList({ items: [] }),
        draft: ""
    });
}

const user = new User({
    id: userModel.name,
    presence: new Presence({ status: UserStatus.Available, description: "" }),
    firstName: "",
    lastName: "",
    username: userModel.name,
    email: "",
    avatar: userModel.avatar,
    bio: ""
});

const extendedStorage = new ExtendedStorage({ groupIdGenerator, messageIdGenerator });

extendedStorage.addUser(new User({
    id: openAIModel.name,
    presence: new Presence({ status: UserStatus.Available, description: "" }),
    firstName: "",
    lastName: "",
    username: openAIModel.name,
    email: "",
    avatar: openAIModel.avatar,
    bio: ""
}));

extendedStorage.addConversation(createConversation(openAIConversationId, openAIModel.name));

// Add users and conversations to the states
// chats.forEach(c => {

//     users.forEach(u => {
//         if (u.name !== c.name) {
//             c.storage.addUser(new User({
//                 id: u.name,
//                 presence: new Presence({status: UserStatus.Available, description: ""}),
//                 firstName: "",
//                 lastName: "",
//                 username: u.name,
//                 email: "",
//                 avatar: u.avatar,
//                 bio: ""
//             }));

//             const conversationId = nanoid();

//             const myConversation = c.storage.getState().conversations.find(cv => typeof cv.participants.find(p => p.id === u.name) !== "undefined");
//             if (!myConversation) {

//                 c.storage.addConversation(createConversation(conversationId, u.name));

//                 const chat = chats.find(chat => chat.name === u.name);

//                 if (chat) {

//                     const hisConversation = chat.storage.getState().conversations.find(cv => typeof cv.participants.find(p => p.id === c.name) !== "undefined");
//                     if (!hisConversation) {
//                         chat.storage.addConversation(createConversation(conversationId, c.name));
//                     }

//                 }

//             }

//         }
//     });

// });

function App() {

    return (
        <div className="mpathic-app h-100 d-flex flex-column overflow-hidden">
            <Container fluid className="p-4 flex-grow-1 position-relative overflow-hidden">
                <Row className="h-100 pt-2 flex-nowrap">
                    <Col>
                        <ExtendedChatProvider serviceFactory={serviceFactory} storage={extendedStorage} config={{
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

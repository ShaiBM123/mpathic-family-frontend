import {useState, useMemo, useCallback, useEffect} from "react";
import { 
    MainContainer, 
    // Sidebar, 
    // ConversationList, 
    // Conversation, 
    Avatar, 
    ChatContainer, 
    ConversationHeader, 
    MessageGroup, 
    Message,
    MessageList, 
    MessageInput, 
    TypingIndicator, 
    MessageModel 
} from "@chatscope/chat-ui-kit-react";

import {
    useChat,
    ChatMessage,
    MessageContentType,
    MessageDirection,
    MessageStatus
} from "@chatscope/use-chat";

import {MessageContent, TextContent, User} from "@chatscope/use-chat";
import {UserMessagePhase, UserMessageContent, OpenAIBotMessage} from "../OpenAIInterfaces";
import {ReactTyped} from "react-typed";
import {openAIModel, openAIConversationId} from "../data/data";
import {
    interPersonalTopicsDictionary, 
    InterPersonalTopics,
    TopicCategoryLevel
} from "./inter-personal-topics/InterPersonalTopics";

import {FeelingsScale} from "./feelings-scale/FeelingsScale";

import "./typing-payload/typing-payload.css"

// import { number, string } from "zod";

// interface IChatPhase {
//     resumed: boolean;
//     phase: UserMessagePhase;
// }

export const Chat = ({user}:{user:User}) => {

    // Get all chat related values and methods from useChat hook 
    const {
        currentMessages, conversations, activeConversation, setActiveConversation,  sendMessage, addMessage, 
        getUser, currentMessage, setCurrentMessage, updateMessage, sendTyping, setCurrentUser
    } = useChat();

    useEffect( () => {
        setCurrentUser(user);
    },[user, setCurrentUser]);
    
    useEffect( () => {
        setActiveConversation(openAIConversationId)
    },[setActiveConversation]);
    
    const nextUserPhaseByHistory = (): UserMessagePhase => {

        if (activeConversation && (currentMessages.length > 0)) 
        {
            let user_group_idx = currentMessages.findLastIndex((g)=>g.senderId === user.id)
            let bot_group_idx = currentMessages.findLastIndex((g)=>g.senderId === openAIModel.name)

            let user_phase = user_group_idx >= 0 ? 
            (currentMessages[user_group_idx].messages.at(-1)?.content as UserMessageContent).phase :
            UserMessagePhase.Start

            if(bot_group_idx >= 0 && bot_group_idx > user_group_idx)
            {
                let bot_msg = currentMessages[bot_group_idx].messages.at(-1) as OpenAIBotMessage
      
                if(!bot_msg.more_info_required && !bot_msg.refusal)
                    user_phase += 1
            }
            return user_phase
        }
        
        return 0;
    }

    const addChatBotMsg = useCallback( (content: unknown, contentType: MessageContentType) => {
        activeConversation &&
        addMessage( new ChatMessage({
            id: "", // Id will be generated by storage generator, so here you can pass an empty string
            content: content as MessageContent<TextContent>,
            contentType: contentType,
            senderId: openAIModel.name,
            direction: MessageDirection.Incoming,
            status: MessageStatus.DeliveredToDevice
        }), activeConversation.id, true); 
    }, [activeConversation, addMessage])

    // show chatbot introductory message on mount
    useEffect( () => {
        if(
            activeConversation && 
            currentMessages.length === 0 &&
            user.username!== openAIModel.name &&
            activeConversation.participants.length === 1 && 
            activeConversation.participantExists(openAIModel.name)){
                addChatBotMsg(openAIModel.initial_message, MessageContentType.TextPlain)
                addChatBotMsg(
                    {
                        ...interPersonalTopicsDictionary, 
                        active: true,
                        selected: false, 
                        selected_categories:{level: TopicCategoryLevel.Level_0, topics_key: [], topics_titles: []}, 
                        inter_personal_topics: true
                    }, 
                    MessageContentType.Other)     
            }
    },[activeConversation, addChatBotMsg, currentMessages.length, user.username]);

    // Get current user data
    const [currentUserAvatar, currentUserName] = useMemo(() => {
        if (activeConversation) {
            const participant = activeConversation.participants.length > 0 ? activeConversation.participants[0] : undefined;
            if (participant) {
                const user = getUser(participant.id);
                if (user) {
                    return [<Avatar src={user.avatar} />, user.username]
                }
            }
        }
        return [undefined, undefined];
    }, [activeConversation, getUser]);

    const handleChange = (value:string) => {
        // Send typing indicator to the active conversation
        // You can call this method on each onChange event
        // because sendTyping method can throttle sending this event
        // So typing event will not be send to often to the server
        setCurrentMessage(value);
        if ( activeConversation ) {
            sendTyping({
                conversationId: activeConversation?.id,
                isTyping:true,
                userId: user.id,
                content: value, // Note! Most often you don't want to send what the user types, as this can violate his privacy!
                throttle: true
            });
        }
    }

    // const phase = !chatPhase.resumed && chatPhase.phase === UserMessagePhase.Start ? ;

    const doSend = (text: string) => {
        handleSend('', text)
    }

    const handleSend = (innerHtml: string, text: string) => {

        let nextUserPhase = nextUserPhaseByHistory();

        const message = new ChatMessage({
            id: "", // Id will be generated by storage generator, so here you can pass an empty string
            // content: text as unknown as MessageContent<TextContent>,
            content: {user_text: text, phase: nextUserPhase} as UserMessageContent,
            contentType: MessageContentType.Other,
            senderId: user.id,
            direction: MessageDirection.Outgoing,
            status: MessageStatus.Sent
        });
        
        if ( activeConversation ) {
            sendMessage({
                message,
                conversationId: activeConversation.id,
                senderId: user.id,
            });
        }
    };
    

    const getTypingIndicator = useCallback(
        () => {
                if (activeConversation) {
                    const typingUsers = activeConversation.typingUsers;
                    if (typingUsers.length > 0) {
                        const typingUserId = typingUsers.items[0].userId;
                        // Check if typing user participates in the conversation
                        if (activeConversation.participantExists(typingUserId)) {
                            const typingUser = getUser(typingUserId);
                            if (typingUser) {
                                if (typingUserId === openAIModel.name)
                                return <TypingIndicator content={`${typingUser.username} is replying`} />
                                else 
                                return <TypingIndicator content={`${typingUser.username} is typing`} />
                            }
                        }
                    }
                }
            return undefined;

        }, [activeConversation, getUser],
    );
    
    const createTypedTextPayload = (
        chat_msg: ChatMessage<MessageContentType>, 
        // on_completion: () => void,
        content_to_strings: (c: Object) => Array<string>) => {
            return (
                <ReactTyped 
                    className="text-typing-message-container"
                    strings={content_to_strings(chat_msg.content)} 
                    typeSpeed={15} 
                    showCursor={true} 
                    onComplete={()=>{
                        chat_msg.status=MessageStatus.Sent
                        updateMessage(chat_msg)
                        // on_completion()
                    }
                }/> 
            )
    };

    const createMessageModel = 
        (chat_msg: ChatMessage<MessageContentType>) => {

            let message_type;
            let message_payload;
            if(chat_msg.direction === MessageDirection.Incoming)
            {
                if(chat_msg.status === MessageStatus.DeliveredToDevice && 
                    chat_msg.contentType === MessageContentType.TextPlain) 
                {
                    message_type = "custom";
                    message_payload= createTypedTextPayload(chat_msg,
                        (c: Object)=>{
                            return [c as string]
                        });
                }
                else if (chat_msg.status === MessageStatus.DeliveredToDevice && 
                        chat_msg.contentType === MessageContentType.Other){

                        let obj = Object(chat_msg.content)

                        if (obj.inter_personal_topics){
                            message_type = "custom";
                            message_payload=
                            <InterPersonalTopics 
                                topics={obj.major_categories}
                                selected={obj.selected} 
                                selectedCategories={obj.selected_categories} 
                                onTopicSelection={(msg, selected_categories) => {
                                    console.log(msg)

                                    obj.active = false
                                    obj.selected = true
                                    obj.selected_categories = selected_categories
                                    updateMessage(chat_msg)
                                    addChatBotMsg(msg, MessageContentType.TextPlain)
                                    // doSend(msg) 
                                }}
                            />
                        }
                        else if (obj.general_description_analysis){
                            message_type = "custom";
                            // a separate module should be implemented instaed displaying just typed text 
                            message_payload= createTypedTextPayload(chat_msg,
                                // ()=>{
                                //     addChatBotMsg('כעט בבקשה פרט קצת יותר על התחושות שלך בנוגע לכל מה שקרה', MessageContentType.TextPlain)
                                // },

                                (c: Object)=>{
                                    return [String().concat(
                                        Object(c).summery,
                                        `\n\n תצפית אובייקטיבית למה שסיפרת: \n\n ${obj.observation}`)
                                    ]
                                }
                            );
                        }
                        else if (obj.feelings){
                            message_type = "custom";
                            message_payload= 
                            <FeelingsScale feelings={obj.feelings} active={obj.active} 
                                onRescaleDone={(new_feelings, prompt_msg) => {

                                    //DEBUG ***********************
                                    console.log('onRescaleDone: ')
                                    for(let idx in new_feelings)
                                        console.log(new_feelings[Number(idx)]);
                                    // ****************************

                                    obj.active = false
                                    obj.feelings = new_feelings
                                    updateMessage(chat_msg)
                                    doSend(prompt_msg) 
                                }}
                            />
                        }
                }
                else if (chat_msg.status === MessageStatus.Sent && 
                    chat_msg.contentType === MessageContentType.Other){
                        // THIS PART SHOULD BE REMOVED ONCE A SEPARATE MODULE IS IMPLEMENTED 
                        // FOR THE 'general decription analisys' STAGE
                        let obj = Object(chat_msg.content)
                        if (obj.general_description_analysis){
                            message_type = "text";
                            message_payload = String().concat(
                                obj.summery, `\n\n תצפית אובייקטיבית למה שסיפרת: \n\n ${obj.observation}`)

                        }
                }
                else{

                    message_type = 
                    chat_msg.contentType === MessageContentType.Other ? "custom": 
                    chat_msg.contentType === MessageContentType.TextHtml ? "html": 
                    chat_msg.contentType === MessageContentType.Image ? "image": 
                    chat_msg.contentType === MessageContentType.TextPlain ? "text" : 
                    "";
                    message_payload = chat_msg.content
                
                }
            }
            else if(chat_msg.direction === MessageDirection.Outgoing)
            {
                message_type = "text";
                message_payload = (chat_msg.content as UserMessageContent).user_text; 
            }

            let model={
                type: message_type,
                payload: message_payload,
                direction: chat_msg.direction,
                position: "normal"
            }
            return model as MessageModel;
        };

    const oppositeMsgDirection = useCallback(
        (d: MessageDirection)=>{
            if (d===MessageDirection.Incoming)
                return MessageDirection.Outgoing
            else return MessageDirection.Incoming
        }, []
    )

    const toHoldTextInput = ()=>{

        for(let g of currentMessages)
        {
            for(let msg of g.messages)
            {
                if (msg.status === MessageStatus.DeliveredToDevice && 
                    msg.contentType === MessageContentType.Other && 
                    Object(msg.content).active )
                {
                    return true
                }
            }
        }

        return false
    }

    const getMsgCustomizedContentClasses = (m: ChatMessage<MessageContentType>)=> {
        return (Object(m.content).inter_personal_topics ? 'card-message' : '').trim();
    }

    const rtl = process.env.REACT_APP_RTL
    const hold_text_input = toHoldTextInput()

    return (
        <MainContainer responsive>
            
            <ChatContainer>
                {activeConversation && <ConversationHeader>
                    {currentUserAvatar}
                    <ConversationHeader.Content userName={currentUserName} />
                </ConversationHeader>}
                <MessageList typingIndicator={getTypingIndicator()}>
                    {activeConversation && currentMessages.map( (g) => 
                        <MessageGroup key={g.id} 
                            direction={rtl ==='yes' ? 
                                oppositeMsgDirection(g.direction): g.direction}>
                            <Avatar src={user.id === g.senderId ? user.avatar: getUser(g.senderId)?.avatar} />
                            <MessageGroup.Messages>
                                {g.messages.map((m:ChatMessage<MessageContentType>) => 
                                    <Message 
                                        key={m.id} 
                                        model={createMessageModel(m)} 
                                        className={(
                                            (rtl ==='yes' ? "rtl-message" : "") + 
                                            ` ${getMsgCustomizedContentClasses(m)}`
                                            ).trim()}/>)}
                            </MessageGroup.Messages>
                    </MessageGroup>) }
                </MessageList>
                <MessageInput 
                    className={rtl ==='yes' ? "rtl-message" : ""}
                    value={currentMessage} 
                    onChange={handleChange} 
                    onSend={handleSend} 
                    disabled={!activeConversation || hold_text_input} 
                    attachButton={false} 
                    placeholder={rtl ==='yes' ? "הקלד כאן ..." : "Type here..."}/>
            </ChatContainer>
            
        </MainContainer>
    );
    
}
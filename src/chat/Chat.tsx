/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    MessageModel,
    // Button
} from "@chatscope/chat-ui-kit-react";

import { useExtendedChat } from "./ExtendedChatProvider";
import {
    // useChat,
    ChatMessage,
    MessageContentType,
    MessageDirection,
    MessageStatus
} from "@chatscope/use-chat";

import { MessageContent, User } from "@chatscope/use-chat";
import { UserMessageContent, UserPhase } from "../LLM/LLMTypes";
// import { ReactTyped } from "react-typed";
import { Gender, AIModel, AIConversationId } from "../data/data";
import { interPersonalTopicsDictionary } from "../components/inter-personal-topics/InterPersonalTopics";
import { FeelingsScale } from "../components/feelings-scale/FeelingsScale";
// import { TypingText } from "../components/typing-text/TypingText";
// import { completeUserPartOfSpeech } from "../open_ai/OpenAIPromptingManager"
import { OptionButtonsInColumn, OptionButtonsInRow } from "../components/option-buttons-list/OptionButtonsInList";
import { formatMessage, enumKeyStartsWith } from "../AppUtils";
import { useLogOut } from "../AppHooks";
import callApi from "../lib/apisauce/callApi";
import { trackPromise } from "react-promise-tracker";

import rtlTxt from '../rtl-text.json';
import svgMpathicTitle from "../images/chat/mpathic-family-title.svg";
import svgUndo from "../images/chat/undo.svg";
import svgRedo from "../images/chat/redo.svg";
import svgKebabMenu from "../images/chat/kebab-menu.svg";
import "../components/typing-text/typing-text.css"

function genderKey(gender: Gender | undefined): 'female' | 'male' {
    return gender === Gender.Female ? 'female' : 'male';
}

export const Chat = ({ user }: { user: User }) => {

    // Get all chat related values and methods from useChat hook 
    const {
        service,
        currentMessages, activeConversation, setActiveConversation, sendMessage, addMessage,
        getUser, currentMessage, setCurrentMessage, updateMessage, sendTyping, setCurrentUser, currentUser,
        setTopic, setSubTopic, setCorrectedFeelings, setPhase,
        setCurrentUserSessionData, currentUserSessionData: sData, phase,
        removeMessagesFromConversation, removeMessageFromActiveConversation,
        setMessagesInActiveConversation, resetCurrentUserSessionData,
    } = useExtendedChat();

    const [isNumericInput, setIsNumericInput] = useState(false);

    const logOut = useLogOut();

    useEffect(() => {
        setCurrentUser(user);
    }, [user, setCurrentUser]);

    useEffect(() => {
        setActiveConversation(AIConversationId)
    }, [setActiveConversation]);

    // const navigate = useNavigate();
    const JWToken = JSON.parse(sessionStorage.getItem("UserJWT") as string);

    const fetchUserActiveSessionMessages = useCallback(async () => {

        // currentUser && trackPromise(
        return callApi
            .getDatawithToken(
                "get_chatscope_session_messages",
                {
                    email: currentUser?.email,
                    username: currentUser?.username
                },
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                        Authorization: JWToken,
                    },
                }
            )
            .then((res: any) => {
                if (res.data.status === "success") {
                    setMessagesInActiveConversation(res.data.messages);
                    return true;
                }
                return false;
            })
            .catch((res) => {
                return false;
            })
        // );
    }, [JWToken, currentUser]);

    const fetchUserActiveSessionData = useCallback(async () => {

        // currentUser && trackPromise(
        return callApi
            .getDatawithToken(
                "get_session_data",
                {
                    email: currentUser?.email,
                    username: currentUser?.username
                },
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                        Authorization: JWToken,
                    },
                }
            )
            .then((res: any) => {
                if (res.data.status === "success") {
                    if (res.data.chatSessionData) {
                        setCurrentUserSessionData(res.data.chatSessionData);
                    }
                    return true;
                }
                return false;
            })
            .catch((res) => {
                // console.log(res.originalError);
                // navigate("/");
                return false;
            })
        // );
    }, [JWToken, currentUser]);

    const createActiveSessionIfNotExists = useCallback(async () => {

        // currentUser && trackPromise(
        return callApi
            .getDatawithToken(
                "create_user_active_session",
                {
                    email: currentUser?.email,
                    username: currentUser?.username
                },
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                        Authorization: JWToken,
                    },
                }
            )
            .then((res: any) => {
                if (res.data.status === "success") {
                    return true;
                }
                return false;
            })
            .catch((res) => {
                // console.log(res.originalError);
                // navigate("/");
                return false;
            })
        // );
    }, [JWToken, currentUser]);

    useEffect(() => {

        currentUser && trackPromise((async () => {
            let success = false;
            if (await createActiveSessionIfNotExists()) {
                if (await fetchUserActiveSessionData()) {
                    if (await fetchUserActiveSessionMessages()) {
                        success = true;
                    }
                }
            }
            if (!success) {
                removeMessagesFromConversation(AIConversationId);
                resetCurrentUserSessionData();
                logOut();
            }

        })());

    }, [currentUser, AIConversationId, JWToken]);


    // useEffect(() => {
    //     fetchUserActiveSessionData();
    // }, [fetchUserActiveSessionData]);


    // useEffect(() => {
    //     fetchUserActiveSessionMessages();
    // }, [fetchUserActiveSessionMessages]);


    // const scrollToTop = useCallback(() => {
    //     const timer = setTimeout(() => {
    //         const msgGroup = document.getElementsByClassName('cs-message-group')[0];

    //         if (!msgGroup) {
    //             return;
    //         }

    //         msgGroup.scrollIntoView({ behavior: 'auto', block: 'start' });

    //     }, 200);

    //     return () => clearTimeout(timer);

    // }, [])

    // const scrollToBottom = useCallback(() => {
    //     document.getElementsByClassName('cs-message-list__scroll-to')[0]?.scrollIntoView({ behavior: 'auto', block: 'end' })
    // }, [])

    const addChatBotMsg = useCallback((content: unknown, contentType: MessageContentType) => {
        activeConversation &&
            addMessage(new ChatMessage({
                id: "", // Id will be generated by storage generator, so here you can pass an empty string
                content: content as MessageContent<MessageContentType>,
                contentType: contentType,
                senderId: AIModel.name,
                direction: MessageDirection.Incoming,
                status: MessageStatus.DeliveredToDevice
            }), activeConversation.id, true);
    }, [activeConversation, addMessage])


    useEffect(() => {
        if (activeConversation && currentUser) {

            // show chatbot introductory message on mount
            if (currentMessages.length === 0) {

                let uName = currentUser?.firstName;
                setPhase(UserPhase.Start)
                addChatBotMsg(
                    formatMessage(rtlTxt.chat.firstTimeWelcomeMsg, { name: uName }),
                    MessageContentType.TextHtml
                );

                addChatBotMsg(
                    {
                        active: true,
                        selected: false,
                        id: "start_approval"
                    }, MessageContentType.Other
                );
            }

        }

        // setFollowUpChatMessagesRequired(false);

    }, [activeConversation, addChatBotMsg, currentMessages.length, currentUser, setPhase]);

    // Get current user data
    // const [currentUserAvatar, currentUserName] = useMemo(() => {
    //     if (activeConversation) {
    //         const participant = activeConversation.participants.length > 0 ? activeConversation.participants[0] : undefined;
    //         if (participant) {
    //             const user = getUser(participant.id);
    //             if (user) {
    //                 return [<Avatar src={user.avatar} />, user.username]
    //             }
    //         }
    //     }
    //     return [undefined, undefined];
    // }, [activeConversation, getUser]);

    const handleChange = (value: string) => {
        // Send typing indicator to the active conversation
        // You can call this method on each onChange event
        // because sendTyping method can throttle sending this event
        // So typing event will not be send to often to the server
        setCurrentMessage(value);
        if (activeConversation) {
            sendTyping({
                conversationId: activeConversation?.id,
                isTyping: true,
                userId: user.id,
                content: value, // Note! Most often you don't want to send what the user types, as this can violate his privacy!
                throttle: true
            });
        }
    }

    const createUserMessage = useCallback((text: string): ChatMessage<any> => {
        return new ChatMessage({
            id: "", // Id will be generated by storage generator, so here you can pass an empty string
            // content: text as unknown as MessageContent<TextContent>,
            content: { user_text: text } as UserMessageContent,
            contentType: MessageContentType.Other,
            senderId: user.id,
            direction: MessageDirection.Outgoing,
            status: MessageStatus.Sent
        });
    }, [user.id])

    // JUST ADD USER MESSAGE WITHOUT SENDING IT FORWARDED TO THE SERVER
    const addUserMsg = useCallback((text: string) => {
        activeConversation &&
            addMessage(createUserMessage(text), activeConversation.id, true);
    }, [activeConversation, addMessage, createUserMessage])


    const doSend = (text: string) => {
        handleSend('', text)
    }

    const handleSend = (innerHtml: string, text: string) => {

        if (enumKeyStartsWith(UserPhase, phase, 'FE_')) {
            // let uGender: Gender = user?.data?.gender;
            // let uGenderKey = genderKey(uGender);
            setCurrentMessage("");
            addUserMsg(text)
            switch (phase) {

                // case UserMessagePhase.FE_UserName:
                //     setPhase(UserMessagePhase.FE_UserAge)
                //     user.firstName = text;
                //     setCurrentUser(user)
                //     setIsNumericInput(true);
                //     addChatBotMsg(rtlTxt.chat.askWhatIsUserAge[uGenderKey], MessageContentType.TextHtml);
                //     break;
                // case UserMessagePhase.FE_UserAge:
                //     setPhase(UserMessagePhase.FE_MainTopic)
                //     user.data.age = Number(text);
                //     setIsNumericInput(false);
                //     setCurrentUser(user)
                //     addChatBotMsg(rtlTxt.chat.firstTimeGreeting[uGenderKey], MessageContentType.TextHtml);
                //     addChatBotMsg(rtlTxt.chat.firstTimeMainTopicMsg[uGenderKey], MessageContentType.TextHtml);
                //     addChatBotMsg(
                //         {
                //             ...interPersonalTopicsDictionary,
                //             active: true,
                //             selected: false,
                //             id: "inter_personal_main_topics"
                //         }, MessageContentType.Other);
                //     break;
            }
        }
        else if (phase >= UserPhase.BE_NeedsAnalysis) {
            addChatBotMsg("אני מתוכנת עד לשלב זה !", MessageContentType.TextPlain);
        }
        else {
            const message = createUserMessage(text);
            if (activeConversation) {
                sendMessage({
                    message,
                    conversationId: activeConversation.id,
                    senderId: user.id,
                });
            }
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
                            if (typingUserId === AIModel.name)
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

    const setTextMessageBold = (m: ChatMessage<MessageContentType.TextHtml>) => {
        m.content = `<b>${m.content}</b>` as any;
        updateMessage(m);
    }

    const createMessageModel =
        (chat_msg: ChatMessage<MessageContentType>) => {
            // let uName = user?.firstName;
            let uGender = user?.data?.gender;
            let uGenderKey = genderKey(uGender);

            let message_type;
            let message_payload;
            if (chat_msg.direction === MessageDirection.Incoming) {

                // if (chat_msg.status === MessageStatus.DeliveredToDevice &&
                //     chat_msg.contentType === MessageContentType.TextPlain) {

                //     message_type = "custom";
                //     message_payload = <TypingText
                //         // onComplete={() => { }}// DEBUG LINE
                //         chatMsg={chat_msg}
                //         chatMsgContentToStrings={(c: Object) => { return [c as string] }}
                //         onStringTyped={() => {
                //             scrollToBottom()
                //         }} />
                // }
                if (chat_msg.status === MessageStatus.DeliveredToDevice &&
                    chat_msg.contentType === MessageContentType.Other) {

                    message_type = "custom";
                    let obj = Object(chat_msg.content)

                    // if (obj.id === "intro_msg") {

                    //     // a separate module should be implemented instaed displaying just typed text 
                    //     message_payload =
                    //         <TypingText
                    //             chatMsg={chat_msg}
                    //             chatMsgContentToStrings={(c: Object) => {
                    //                 return [Object(c).message]
                    //             }}
                    //             onStringTyped={() => {
                    //                 // scrollToTop()
                    //             }}
                    //         />
                    // }
                    if (obj.id === "start_approval") {

                        // a separate module should be implemented instaed displaying just typed text 
                        message_payload =

                            <OptionButtonsInRow
                                buttonsData={[
                                    { id: "sure", text: rtlTxt.captions.sure },
                                    { id: "next-time", text: rtlTxt.captions.nextTime }
                                ]}
                                onButtonClick={
                                    (id) => {
                                        removeMessageFromActiveConversation(chat_msg.id)
                                        if (id === "sure") {
                                            addUserMsg(rtlTxt.captions.sure);
                                            addChatBotMsg(
                                                rtlTxt.chat.firstTimeMainTopicMsg[uGenderKey],
                                                MessageContentType.TextHtml);
                                            addChatBotMsg(
                                                {
                                                    ...interPersonalTopicsDictionary,
                                                    active: true,
                                                    selected: false,
                                                    selected_categories: null,
                                                    id: "inter_personal_main_topics"
                                                }, MessageContentType.Other);

                                            setPhase(UserPhase.FE_MainTopic)
                                        }
                                        else if (id === "next-time") {
                                            // removeMessagesFromConversation(AIConversationId)
                                            logOut();
                                        }
                                    }
                                }
                            />
                    }
                    else if (obj.id === "inter_personal_main_topics") {
                        message_payload =
                            <OptionButtonsInColumn
                                buttonsData={
                                    Object.entries(obj.major_categories).map(([t_key, t_dct], idx) => {
                                        return {
                                            id: t_key,
                                            text: Object(t_dct).title,
                                            iconSrc: Object(t_dct).iconSrc
                                        }
                                    })
                                }
                                onButtonClick={
                                    (id) => {
                                        obj.selected = true;
                                        obj.active = false;
                                        let category = obj.major_categories[id];
                                        setTopic(category.description !== undefined ? category.description : category.title)
                                        removeMessageFromActiveConversation(chat_msg.id)
                                        addUserMsg(category.title);
                                        if (category.title === rtlTxt.captions.other) {
                                            setPhase(UserPhase.BE_PersonInConflictRelation)
                                            addChatBotMsg(
                                                rtlTxt.chat.personInConflictRelationMsg[uGenderKey],
                                                MessageContentType.TextHtml);
                                        } else {
                                            setPhase(UserPhase.FE_SubTopic)
                                            addChatBotMsg(
                                                rtlTxt.chat.subTopicMsg[uGenderKey],
                                                MessageContentType.TextHtml);
                                            addChatBotMsg(
                                                {
                                                    ...obj.major_categories[id],
                                                    active: true,
                                                    selected: false,
                                                    id: "inter_personal_sub_topics"
                                                }, MessageContentType.Other);
                                        }
                                    }
                                }
                            />
                    }
                    else if (obj.id === "inter_personal_sub_topics") {
                        message_payload =
                            <OptionButtonsInColumn
                                buttonsData={
                                    Object.entries(obj.sub_categories).map(([t_key, t_dct], idx) => {
                                        return {
                                            id: t_key,
                                            text: Object(t_dct).title,
                                            bold: false
                                        }
                                    })
                                }
                                onButtonClick={
                                    (id) => {
                                        obj.selected = true;
                                        obj.active = false;
                                        let category = obj.sub_categories[id];
                                        setSubTopic(category.description !== undefined ? category.description : category.title)
                                        removeMessageFromActiveConversation(chat_msg.id)

                                        setPhase(UserPhase.BE_PersonInConflictRelation)
                                        addUserMsg(category.title);
                                        addChatBotMsg(
                                            rtlTxt.chat.personInConflictRelationMsg[uGenderKey],
                                            MessageContentType.TextHtml);

                                    }
                                }
                            />
                    }
                    else if (obj.id === "observation_approval") {

                        // a separate module should be implemented instaed displaying just typed text 
                        message_payload =

                            <OptionButtonsInRow
                                buttonsData={[
                                    { id: "ok", text: rtlTxt.captions.right },
                                    { id: "not-accurate", text: rtlTxt.captions.notAccurate }
                                ]}
                                onButtonClick={
                                    (id) => {
                                        removeMessageFromActiveConversation(chat_msg.id)
                                        if (id === "ok") {
                                            setTextMessageBold(currentMessages.at(-1)?.messages[0] as ChatMessage<MessageContentType>)
                                            addUserMsg(rtlTxt.captions.right);

                                            addChatBotMsg(rtlTxt.chat.feelingsAdjustmentGuidelines[uGenderKey], MessageContentType.TextHtml)
                                            addChatBotMsg(
                                                {
                                                    feelings: obj.feelings,
                                                    active: true,
                                                    selected: false,
                                                    id: "feelings"
                                                }, MessageContentType.Other);

                                            setPhase(UserPhase.BE_FeelingsAnalysis)
                                        }
                                        else if (id === "not-accurate") {
                                            addUserMsg(rtlTxt.captions.notAccurate);
                                            let rc = sData.description_analysis.refinement_count || 0;
                                            let msg = rc <= 0 ?
                                                rtlTxt.chat.initialCallForMoreAccurateInfo[uGenderKey]
                                                :
                                                rtlTxt.chat.callForMoreAccurateInfo[uGenderKey]

                                            addChatBotMsg(msg, MessageContentType.TextHtml)
                                            setPhase(UserPhase.BE_DescriptionAnalysis)
                                        }
                                    }
                                }
                            />
                    }
                    else if (obj.id === "feelings") {

                        message_payload =
                            <FeelingsScale feelings={obj.feelings} active={obj.active}
                                onRescaleDone={(new_feelings, prompt_msg) => {
                                    obj.active = false
                                    obj.feelings = new_feelings
                                    updateMessage(chat_msg)
                                    setCorrectedFeelings(new_feelings)
                                    // send message directly from chat service to the server
                                    service.sendMessage({ message: createUserMessage(prompt_msg), conversationId: AIConversationId })
                                }}
                            />
                    }
                }
                // else if (chat_msg.status === MessageStatus.Sent &&
                //     chat_msg.contentType === MessageContentType.Other) {

                //     let obj = Object(chat_msg.content)
                //     if (["intro_msg"].includes(obj.id)) {
                //         message_type = "text";
                //         message_payload = obj.message;
                //     }
                // }
                else {

                    message_type =
                        chat_msg.contentType === MessageContentType.Other ? "custom" :
                            chat_msg.contentType === MessageContentType.TextHtml ? "html" :
                                chat_msg.contentType === MessageContentType.Image ? "image" :
                                    chat_msg.contentType === MessageContentType.TextPlain ? "text" :
                                        "";
                    message_payload = chat_msg.content

                }
            }
            else if (chat_msg.direction === MessageDirection.Outgoing) {
                message_type = "text";
                message_payload = (chat_msg.content as UserMessageContent).user_text;
            }

            let model = {
                type: message_type,
                payload: message_payload,
                direction: chat_msg.direction,
                position: "normal"
            }
            return model as MessageModel;
        };

    const toHoldTextInput = () => {

        for (let g of currentMessages) {
            for (let msg of g.messages) {
                if (msg.status === MessageStatus.DeliveredToDevice &&
                    msg.contentType === MessageContentType.Other &&
                    Object(msg.content).active) {
                    return true
                }
            }
        }
        return false
    }

    const getMsgCustomizedContentClasses = (m: ChatMessage<MessageContentType>) => {
        return (Object(m.content).id === "inter_personal_topics" ? 'card-message' : '').trim();
    }

    const rtl = process.env.REACT_APP_RTL
    const hold_text_input = toHoldTextInput()

    return (
        <MainContainer responsive>

            <ChatContainer>
                {activeConversation && <ConversationHeader>
                    <ConversationHeader.Content>
                        <div className="chat-header">
                            <img src={svgMpathicTitle} alt="Mpathic Family Title" />
                            <div className="buttons-wrapper">
                                <div className="buttons-container">
                                    <button>
                                        <img src={svgUndo} alt="Undo" />
                                    </button>
                                    <div>חזרה</div>
                                </div>
                                <div className="buttons-container redo-button-container">
                                    <button className="redo-button">
                                        <img src={svgRedo} alt="Redo" />
                                    </button>
                                    <div>קדימה</div>
                                </div>
                                <div className="buttons-container kebab-menu-container">
                                    <button>
                                        <img src={svgKebabMenu} alt="Menu" />
                                    </button>
                                    <div></div> {/* Empty caption with 18px height */}
                                </div>
                            </div>
                        </div>
                        {/* Other components and elements */}
                    </ConversationHeader.Content>
                </ConversationHeader>}

                <MessageList
                    typingIndicator={getTypingIndicator()}
                // autoScrollToBottom={true} 
                // autoScrollToBottomOnMount={false} 
                // scrollBehavior={"auto"}
                >

                    {activeConversation && currentMessages.map((g) =>
                        <MessageGroup key={g.id}
                            direction={g.direction}>
                            <Avatar src={user.id === g.senderId ? user.avatar : getUser(g.senderId)?.avatar} />
                            <MessageGroup.Messages>
                                {g.messages.map((m: ChatMessage<MessageContentType>) =>
                                    <Message
                                        key={m.id}
                                        model={createMessageModel(m)}
                                        className={(`${getMsgCustomizedContentClasses(m)}`).trim()} />)}
                            </MessageGroup.Messages>
                        </MessageGroup>)}
                </MessageList>
                <MessageInput
                    value={currentMessage}
                    onChange={handleChange}
                    onSend={handleSend}
                    disabled={!activeConversation || hold_text_input}
                    attachButton={false}
                    placeholder={rtl === 'yes' ? rtlTxt.captions.typeHere : "Type here..."}
                    inputMode={isNumericInput ? "numeric" : "text"}
                    onBeforeInput={(event: any) => {
                        if (isNumericInput && !/^\d*$/.test(event.data)) {
                            event.preventDefault();
                        }
                    }}
                />

            </ChatContainer>

        </MainContainer>
    );

}
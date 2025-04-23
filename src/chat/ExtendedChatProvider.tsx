import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
// import type { ReactNode } from "react";
// import {
//     ChatEventType
// } from "@chatscope/use-chat/dist/enums";

import {
    useChat as useOriginalChat,
    ChatProvider as BaseChatProvider,
    MessageGroup
} from "@chatscope/use-chat";

import type {
    IChatService,
    IStorage,
    UpdateState,
    ChatProviderProps
} from "@chatscope/use-chat";

import { ExtendedStorage, ExtendedChatState } from '../data/ExtendedStorage';
import { UserPhase } from '../LLM/LLMTypes';
import { UserChatSessionData, UserFeeling } from "../data/ChatSessionData";

export enum PhaseOperation { StartNewPhase = 1, KeepPhaseAndIncrement = 2, KeepPhase = 3 }

interface ExtendedChatContextProps {
    setTopic: (value: string) => void;
    setSubTopic: (value: string) => void;
    setCorrectedFeelings: (feelings: UserFeeling[]) => void;
    phase: UserPhase;
    moreUserInputRequired: boolean;
    followUpChatMessagesRequired: boolean;
    setMoreUserInputRequired: (moreInputRequired: boolean) => void;
    setFollowUpChatMessagesRequired: (followUpChatMessagesRequired: boolean) => void;
    setPhase: (phase: UserPhase) => void;
    removeMessageFromActiveConversation: (messageId: string) => void;
    // addOpenAIHistoryText: (role: "user" | "assistant" | "system", txt: string) => void;
    currentUserSessionData: UserChatSessionData;
    setCurrentUserSessionData: (data: UserChatSessionData) => void;
    resetCurrentUserSessionData: () => void;
    setMessagesInActiveConversation(messages: Array<MessageGroup>): void;
}

// Create a context for these properties
const extendedContext = createContext<ExtendedChatContextProps | undefined>(undefined);


export const useExtendedChat = () => {
    // Access the original chat context
    const originalChatContext = useOriginalChat();

    // Access the extended context
    const extendedChatContext = useContext(extendedContext);
    if (!extendedChatContext) {
        throw new Error('useExtendedChat must be used within an ExtendedChatProvider');
    }

    // Combine original and extended contexts
    return {
        ...originalChatContext,
        ...extendedChatContext,
    };
};


interface ExtendedChatProviderProps<S extends IChatService> extends ChatProviderProps<S> {
    // New or extended properties
    storage: ExtendedStorage; // override
}

export const ExtendedChatProvider = <S extends IChatService>({
    serviceFactory,
    storage,
    config,
    children,
}: ExtendedChatProviderProps<S>): JSX.Element => {
    const s = storage.getState() as ExtendedChatState
    const [state, setState] = useState<ExtendedChatState>(s);

    const updateExtendedState = useCallback(() => {
        setState(storage.getState() as ExtendedChatState);
    }, [setState, storage]);

    // Add more states or properties
    // const [topic, setTopic] = useState('');
    // const [subTopic, setSubTopic] = useState('');

    /**
 * Set complete current user session data
 * @param {UserChatSessionData} data
*/
    const setCurrentUserSessionData = useCallback(
        (data: UserChatSessionData) => {
            storage.setCurrentUserSessionData(data);
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );

    const resetCurrentUserSessionData = useCallback(
        () => {
            storage.resetCurrentUserSessionData();
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );
    /**
     * Set topic of message in current conversation
     * @param {String} topic
    */
    const setTopic = useCallback(
        (topic: string) => {
            storage.setTopic(topic);
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );

    /**
    * Set topic of message in current conversation
    * @param {String} subTopic
    */
    const setSubTopic = useCallback(
        (subTopic: string) => {
            storage.setSubTopic(subTopic);
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );

    /**
* Set topic of message in current conversation
* @param feelings
*/
    const setCorrectedFeelings = useCallback(
        (feelings: UserFeeling[]) => {
            storage.setCorrectedFeelings(feelings);
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );

    /**
     * Sets current phase and transition
     * @param {UserPhase} phase
     * 
     */
    const setPhase = useCallback(
        (phase: UserPhase) => {
            storage.setPhase(phase);
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );

    /**
    * Set to wether more user input is required to complete the phase 
    * @param {boolean} moreInputRequired
    */
    const setMoreUserInputRequired = useCallback(
        (moreInputRequired: boolean) => {
            storage.setMoreUserInputRequired(moreInputRequired);
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );


    /**
    * Set to wether more user input is required to complete the phase 
    * @param {boolean} followUpChatMessagesRequired
    */
    const setFollowUpChatMessagesRequired = useCallback(
        (followUpChatMessagesRequired: boolean) => {
            storage.setFollowUpChatMessagesRequired(followUpChatMessagesRequired);
            updateExtendedState();
        },
        [storage, updateExtendedState]
    );


    const removeMessageFromActiveConversation = useCallback(
        (messageId: string): void => {
            storage.removeMessageFromActiveConversation(messageId);
            updateExtendedState();
        }, [storage, updateExtendedState]
    );

    const setMessagesInActiveConversation = useCallback((messages: Array<MessageGroup>): void => {
        storage.setMessagesInActiveConversation(messages);
        updateExtendedState();
    }, [storage, updateExtendedState]);

    // const addOpenAIHistoryText = useCallback((role: "user" | "assistant" | "system", txt: string) => {
    //     storage.addOpenAIHistoryText(role, txt);
    //     updateExtendedState();
    // }, [storage, updateExtendedState])

    const extendedContextValue: ExtendedChatContextProps = {
        setTopic, setSubTopic, setCorrectedFeelings, setPhase,
        setCurrentUserSessionData, resetCurrentUserSessionData,
        setMoreUserInputRequired, setFollowUpChatMessagesRequired,
        removeMessageFromActiveConversation, setMessagesInActiveConversation,

        moreUserInputRequired: state.moreUserInputRequired,
        followUpChatMessagesRequired: state.followUpChatMessagesRequired,
        phase: state.currentUserSessionData.user_phase,
        currentUserSessionData: state.currentUserSessionData,
    };

    // Create serviceFactory
    const extendedServiceFactory = (storage: IStorage, updateState: UpdateState) => {
        return serviceFactory(storage, () => {
            updateState();
            updateExtendedState();
        })
    };

    // Render the original ChatProvider
    return (
        <extendedContext.Provider value={extendedContextValue}>
            <BaseChatProvider serviceFactory={extendedServiceFactory} storage={storage} config={config}>
                {children} {/* Pass children to maintain existing component structure */}
            </BaseChatProvider>
        </extendedContext.Provider>
    );
};


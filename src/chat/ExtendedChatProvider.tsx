import React, { createContext, useContext, useState, useCallback } from 'react';
// import type { ReactNode } from "react";
import {
    useChat as useOriginalChat,
    ChatProvider as BaseChatProvider,
} from "@chatscope/use-chat";

import type {
    IChatService,
    IStorage,
    UpdateState,
    ChatProviderProps
} from "@chatscope/use-chat";


import { ExtendedStorage, ExtendedChatState } from '../data/ExtendedStorage';
import { UserMessagePhase } from '../open_ai/OpenAITypes';

export enum PhaseOperation { StartNewPhase = 1, KeepPhaseAndIncrement = 2, KeepPhase = 3 }

interface ExtendedChatContextProps {
    setTopic: (value: string) => void;
    setSubTopic: (value: string) => void;
    phaseCount: number;
    moreUserInputRequired: boolean;
    setMoreUserInputRequired: (moreInputRequired: boolean) => void;
    setPhase: (phase: UserMessagePhase) => void;
    removeMessageFromActiveConversation: (messageId: string) => void;
    addOpenAIHistoryText: (role: "user" | "assistant" | "system", txt: string) => void;
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
     * Sets current phase and transition
     * @param {UserMessagePhase} phase
     * 
     */
    const setPhase = useCallback(
        (phase: UserMessagePhase) => {

            if (storage.getState().phase === phase) {

                storage.setPhaseCount(storage.getState().phaseCount + 1);
            }
            else {
                storage.setPhase(phase);
                storage.setPhaseCount(0);
            }

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


    const removeMessageFromActiveConversation = useCallback(
        (messageId: string): void => {
            storage.removeMessageFromActiveConversation(messageId);
            updateExtendedState();
        }, [storage, updateExtendedState]
    );

    const addOpenAIHistoryText = useCallback((role: "user" | "assistant" | "system", txt: string) => {
        storage.addOpenAIHistoryText(role, txt);
        updateExtendedState();
    }, [storage, updateExtendedState])

    const extendedContextValue: ExtendedChatContextProps = {
        setTopic, setSubTopic, setPhase, setMoreUserInputRequired,
        removeMessageFromActiveConversation, addOpenAIHistoryText,
        moreUserInputRequired: state.moreUserInputRequired, phaseCount: state.phaseCount
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


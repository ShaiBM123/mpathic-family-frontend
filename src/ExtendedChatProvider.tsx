import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
// import type { ReactNode } from "react";
import {
    useChat as useOriginalChat,
    ChatProvider as BaseChatProvider,
} from "@chatscope/use-chat";
import type { IChatService } from "@chatscope/use-chat";
import { ChatProviderProps } from "@chatscope/use-chat";
import { ExtendedStorage, ExtendedChatState } from './data/ExtendedStorage';


interface ExtendedChatContextProps {
    // topic: string;
    setTopic: (value: string) => void;
    // subTopic: string;
    setSubTopic: (value: string) => void;
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
    const { phase, phaseTransition, topic, subTopic } = storage.getState() as ExtendedChatState
    const [state, setState] = useState<ExtendedChatState>({ phase, phaseTransition, topic, subTopic });

    const updateExtendedState = useCallback(() => {
        const { phase, phaseTransition, topic, subTopic } = storage.getState() as ExtendedChatState
        setState({ phase, phaseTransition, topic, subTopic });
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
    // const { topic, setTopic, subTopic, setSubTopic } = storage?.getState();

    const extendedContextValue: ExtendedChatContextProps = {
        setTopic, setSubTopic
    };

    // Render the original ChatProvider
    return (
        <extendedContext.Provider value={extendedContextValue}>
            <BaseChatProvider serviceFactory={serviceFactory} storage={storage} config={config}>
                {children} {/* Pass children to maintain existing component structure */}
            </BaseChatProvider>
        </extendedContext.Provider>
    );
};


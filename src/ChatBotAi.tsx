import React, { act } from 'react';
import { FullChatbot, ChatCardProps, HistoryCardProps } from "chatbot-ai-lib";
import Session from './Handlers/Session.ts';
import SessionManager from './Handlers/SessionManager.ts';
import { constants } from  './constants.js';
import exprts from './Authorization/GenericGraph.ts';
import LoginCard from './Components/LoginCard.ts';
import { ErrorBoundary } from 'react-error-boundary';

interface ChatBotAIProps {
    manager: SessionManager;
}

const ChatBotAI = (props: ChatBotAIProps) => {
    const manager = props.manager;
    const [activeSession, setActiveSession] = React.useState(manager.activeSessions.get(manager.activeSessionId));
    const [session_id, setSessionId] = React.useState(manager.activeSessionId);
    const [chats, setChats] = React.useState<ChatCardProps[]>([]);
    const [session_history, setSessionHistory] = React.useState<HistoryCardProps[]>([]);
    React.useEffect(() => {
        if (manager.activeSessionId === manager.defaultSessionId ||
            exprts.getMyId() === undefined ||
            exprts.getMyId() === "") {
            return;
        }
        const fetchSessionHistory = async () => {
            const summaries = (await manager.getSessionHistorySummaries()) || [];
            setSessionHistory(summaries);
        };
        fetchSessionHistory();
    }, [session_id]);
    React.useEffect(() => {
        let fetchChats: () => Promise<void>;
        if (manager.activeSessionId === manager.defaultSessionId ||
            exprts.getMyId() === "" ||
            exprts.getMyId() === undefined
        ) {
            setChats([LoginCard()]);
        }
        fetchChats = async () => {
            activeSession?.fetchLatestChats().then((chats: ChatCardProps[]) => setChats(chats));
        };
        fetchChats();
    }, [session_id]);

    const chatbot =  (
        <div style={{ height: "100vh" }}>
            <ErrorBoundary
                FallbackComponent={() => <div>Error loading chatbot</div>}
                onError={(error, info) => {
                    console.error("Error loading chatbot: ", error, info);
                }}> 
                <FullChatbot
                    aiName={activeSession?.settings.client_settings?.aiName || "AI"}
                    aiProfileImage={activeSession?.settings.client_settings?.aiProfileImage || ""}
                    chats={chats}
                    compactLogo={activeSession?.settings.client_settings?.compactLogo || ""}
                    fullLogo={activeSession?.settings.client_settings?.fullLogo || ""}
                    handleActionCardClick={handleActionCardClick}
                    history={session_history}
                    isMobile={false}
                    isProfileImageRequired={constants.requireProfileImage}
                    onCardClick={handleCardClick}
                    onChatScroll={handleChatScroll}
                    onChatScrollBottom={handleChatScrollBottom}
                    onChatScrollTop={handleChatScrollTop}
                    onChatSubmit={handleChatSubmit}
                    onCreateNewChat={createNewChat}
                    onFileUpload={handleFileUpload}
                    onHistoryScroll={handleHistoryScroll}
                    onHistoryScrollBottom={handleHistoryScrollBottom}
                    onHistoryScrollTop={handleHistoryScrollTop}
                    onSearchChange={handleSearchChange}
                    onStarClick={handleStarClick}
                    onTextFeedbackSubmit={handleTextfeedbackSubmit}
                    sessionId={session_id}
                    userName={activeSession?.settings.client_settings?.userName || "User"}
                    userProfileImage={activeSession?.settings.client_settings?.userProfileImage || ""}
                />
            </ErrorBoundary>
        </div>
    );

    return chatbot;

    function handleActionCardClick() {
        // handle action card click event
    }

    function handleCardClick(cardDetails: HistoryCardProps) {
        if (!cardDetails.sessionId || cardDetails.sessionId === session_id) {
            return;
        }
    }

    function handleChatScroll(e: React.UIEvent<HTMLDivElement>) {
        // handle scroll event
        const container = e.target as HTMLDivElement;
        if (container.scrollTop === 0) {
            handleChatScrollTop();
        }
        if (container.scrollTop + container.clientHeight === container.scrollHeight) {
            handleChatScrollBottom();
        }
    }

    function handleChatScrollBottom() {
        // handle scroll bottom event
    }

    function handleChatScrollTop() {
        // handle scroll top event
        const oldest_chat = chats[chats.length - 1];
        if (activeSession && oldest_chat && oldest_chat.chatId) {
            activeSession.fetchPreviousChats(oldest_chat.chatId).then((chats: ChatCardProps[]) => {
                const oldChats = chats.filter((chat: ChatCardProps) => !chats.find((c: ChatCardProps) => c.chatId === chat.chatId));
                setChats([...chats, ...oldChats]);
            });
        }
    }

    function handleChatSubmit(message: string, sessionId?: string) {
        if (!sessionId) {
            createNewChat();
        }
        if (activeSession) {
            activeSession.sendChat({message}).then((chat: ChatCardProps) => {
                setChats([...chats, chat]);
            }
        );
        }
    }

    function handleFileUpload(file: File) {
        // handle file upload event
    }

    function handleHistoryScroll() {
        // handle scroll event
    }

    function handleHistoryScrollBottom() {
        // handle scroll bottom event
    }

    function handleHistoryScrollTop() {
        // handle scroll top event
    }

    function handleSearchChange(searchText: string) {
        // handle search change event
    }

    function handleStarClick() {
        // handle star click event
    }

    function handleTextfeedbackSubmit() {
        // handle text feedback submit event
    }

    function updateSessionId(sessionId: string) {
        setSessionId(sessionId);
        setActiveSession(manager.activeSessions.get(sessionId));
        setActiveCardId(sessionId);
        manager.activeSessionId = sessionId;
        return manager.activeSessionId;
    }

    function createNewChat() {
        const session = new Session(manager);
        updateSessionId(session.session_id);
        return session;
    }

    function setActiveCardId(sessionId: string) {
        // ensure all items have not active state except the one with the sessionId
        const updatedHistory: HistoryCardProps[] = session_history.map((item: HistoryCardProps) => {
            item.isActive = item.sessionId === sessionId;
            return item;
        });
        // move the active item to the top
        const activeItem = updatedHistory.find((item: HistoryCardProps) => item.isActive);
        if (activeItem) {
            updatedHistory.splice(updatedHistory.indexOf(activeItem), 1);
            updatedHistory.unshift(activeItem);
        }
    }
}

export default ChatBotAI;
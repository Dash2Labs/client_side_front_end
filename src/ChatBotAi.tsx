import React from 'react';
import { FullChatbot, ChatCardProps, HistoryCardProps } from "chatbot-ai-lib";
import Session from './Handlers/Session';
import SessionManager from './Handlers/SessionManager';

interface ChatBotAIProps {
    manager: SessionManager;
}

const ChatBotAI = (props: ChatBotAIProps) => {
    const manager = props.manager;
    const [session_id, setSessionId] = React.useState(manager.activeSessionId);
    const [chats, setChats] = React.useState<ChatCardProps[]>([]);
    const [session_history, setSessionHistory] = React.useState<HistoryCardProps[]>([]);
    React.useEffect(() => {
        const fetchSessionHistory = async () => {
            const summaries = (await manager.getSessionHistorySummaries()) || [];
            setSessionHistory(summaries);
        };
        fetchSessionHistory();
    }, []);
    React.useEffect(() => {
        const fetchChats = async () => {
            getActiveSession().getChatHistory().then((chats) => setChats(chats));
            setChats(chats);
        };
        fetchChats();
    }, []);

    const chatbot =  (
        <div style={{ height: "100vh" }}>
            <FullChatbot
                aiName="AI"
                aiProfileImage=""
                chats={chats}
                compactLogo=""
                fullLogo=""
                handleActionCardClick={handleActionCardClick}
                history={session_history}
                isMobile={false}
                isProfileImageRequired={false}
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
                userName="User"
                userProfileImage=""
            />
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
        updateSessionId(cardDetails.sessionId);
        const session = getActiveSession();
        if (session) {
            setActiveCardId(cardDetails.sessionId);
        }
        // Load the new active session chats
        const history = session?.getChatHistory() || [];
        history.then((res) => setChats(res));
    }

    function handleChatScroll() {
        // handle scroll event
    }

    function handleChatScrollBottom() {
        // handle scroll bottom event
    }

    function handleChatScrollTop() {
        // handle scroll top event
    }

    function handleChatSubmit(message: string, sessionId?: string) {
        if (!sessionId) {
            createNewChat();
        }
        const session = getActiveSession();
        if (session) {
            session.sendChat({message});
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
        manager.activeSessionId = sessionId;
        return manager.activeSessionId;
    }

    function getActiveSession() {
        return manager.activeSessions.get(session_id) || createNewChat();
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
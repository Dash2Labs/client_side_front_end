import React from 'react';
import FullChatBot, { HistoryItem, ChatCardProps} from "chatbot-ai-lib";
import Session from './Handlers/Session';
import SessionManager from './Handlers/SessionManager';

interface ChatBotAIProps {
    manager: SessionManager;
}

const ChatBotAI = (props: ChatBotAIProps) => {
    const manager = props.manager;
    const [session_id, setSessionId] = React.useState(manager.activeSessionId);
    const [chats, setChats] = React.useState<ChatCardProps[]>([]);
    const [session_history, setSessionHistory] = React.useState<HistoryItem[]>([]);
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

    const chatbot = 
        (<div style={{ height: "100vh" }}>
            <FullChatBot
                history={session_history}
                chats={chats}
                sessionId={session_id}
                onChatSubmit={handleChatSubmit}
                onChatScroll={handleChatScroll}
                onChatScrollTop={handleChatScrollTop}
                onCardClick={handleCardClick}
                onSearchChange={handleSearchChange}
                onFileUpload={handleFileUpload}
                onCreateNewChat={createNewChat}
                onStarClick={handleStarClick}
                onTextfeedbackSubmit={handleTextfeedbackSubmit}
                userName="User"
                userProfileImage=""
                aiName="AI"
                aiProfileImage=""
                isProfileImageRequired={false}
                onHistoryScroll={handleHistoryScroll}
                onHistoryScrollTop={handleHistoryScrollTop}
                onHistoryScrollBottom={handleHistoryScrollBottom}
                fullLogo=""
                compactLogo=""
                isMobile={false}
            />

        </div>
    );

    return chatbot;

    function handleChatScroll() {
        // handle scroll event
    }

    function handleChatScrollTop() {
        // handle scroll top event
    }

    function handleSearchChange(searchText: string) {
        // handle search change event
    }

    function handleFileUpload(file: File) {
        // handle file upload event
    }

    function handleStarClick()
    {
        //handle clicking of star
    }

    function handleTextfeedbackSubmit()
    {
        //handle feedback submissions
    }

    function handleHistoryScroll()
    {
        //handle history appearing when scrolling
    }

    function handleHistoryScrollTop()
    {
        // handle when at the top of the scroll, newest info
    }

    function handleHistoryScrollBottom()
    {
        // HANDLE HISTORY when there is no more 
    }


    function updateSessionId (sessionId: string) {
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
    
    function handleChatSubmit(message: string, sessionId?: string) {
        if (!sessionId) {
            createNewChat();
        }
        const session = getActiveSession();
        if (session) {
            session.sendChat({message});
        }
    }

    function handleCardClick(cardDetails: HistoryItem) {
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

    function setActiveCardId(sessionId: string) {
        // ensure all items have not active state except the one with the sessionId
        const updatedHistory: HistoryItem[] = session_history.map((item: HistoryItem) => {
            item.isActive = item.sessionId === sessionId;
            return item;
        });
        // move the active item to the top
        const activeItem = updatedHistory.find((item: HistoryItem) => item.isActive);
        if (activeItem) {
            updatedHistory.splice(updatedHistory.indexOf(activeItem), 1);
            updatedHistory.unshift(activeItem);
        }

    }
}

export default ChatBotAI;
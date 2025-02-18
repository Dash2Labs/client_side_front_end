import React from 'react';  // eslint-disable-line
import ChatBotAI from './ChatBotAi.tsx';
import SessionManager from './Handlers/SessionManager.ts';

const App = () => {
    return <ChatBotAI manager={new SessionManager}/>;
}

export default App;
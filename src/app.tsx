import React from 'react';  // eslint-disable-line
import SessionManager from './Managers/Session.ts';
import ChatBotify from './ChatBotify.tsx';
import Session from './Handlers/Session.ts';

const App = () => {
    SessionManager.ManageSessions();
    return <ChatBotify session= {new Session()}/>;
}

export default App;
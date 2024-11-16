import React from 'react';  // eslint-disable-line
import ChatBotify from './ChatBotify.tsx';
import Session from './Handlers/Session.ts';

const App = () => {
    return <ChatBotify session= {new Session()}/>;
}

export default App;
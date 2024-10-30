import React from 'react';  // eslint-disable-line
import SessionManager from './Managers/Session.ts';

const App = () => {
    SessionManager.ManageSessions();
    return <></>;
}

export default App;
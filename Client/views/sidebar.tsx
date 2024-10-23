import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <ul className="menu">
                <li>New Chat</li>
                <li>Search</li>
                <li>Current Trends...</li>
                <li>What is the...</li>
                <li>Password Polic...</li>
            </ul>
            <div className="settings">
                Settings
            </div>
        </div>
    );
};

export default Sidebar;

import React from "react"; // eslint-disable-line
import ChatBot from "react-chatbotify";
import SessionHandler from './Handlers/Session.ts';
import { Message } from './Models/Message.ts';

type ChatBoftifyProps = {
    session: SessionHandler
}
const ChatBotify = (props: ChatBoftifyProps) => {
    let hasError = false;
    const { session } = props;
    const flow = {
        start: {
            message: "Hello, how can I help you?",
            path: "loop"
        },
        loop: {
            message: (params: any) => { // eslint-disable-line
                let response: Message;
                try {
                    response = session.sendChat(params.UserInput);
                } catch {
                    response = {
                        speaker: "ChatBot",
                        message: "Sorry, I am unable to process your request at this time.",
                        timestamp: new Date().toISOString()
                    };
                    hasError = true;
                }
                return response.message;
            },
            path: () => {
                if (hasError) {
                    return "start";
                }
                return "loop";
            }
        }
    };
    return <ChatBot flow={flow}/>;
};

export default ChatBotify;
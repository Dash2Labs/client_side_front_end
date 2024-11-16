import React from "react"; // eslint-disable-line
import ChatBot from "react-chatbotify";
import SessionHandler from './Handlers/Session.ts';
import { Message } from './Models/Message.ts';
import Footer from './Components/Footer.tsx';
import { ChatObject } from "./Handlers/Chat.ts";

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
            message: async (params: any) => { // eslint-disable-line
                let response: Message;
                let question: ChatObject = {
                    question: params.userInput,
                };
                try {
                    response = await session.sendChat(question);
                } catch (error) {
                    console.error("Error sending chat: ", error);
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
    return <ChatBot flow={flow} settings={{header: {"title": "HIPPA for Humans" }, footer: {text: <Footer logo="./assets/botIcon.png" />}}}/>;
};

export default ChatBotify;


import { ChatCardProps, Action } from "chatbot-ai-lib";
import { constants } from '../constants.js';

const LoginCard = () => {
    const id = "login-card";
    const sender: "ai" = "ai";
    const type: "actionCard" = "actionCard";
    const text = constants.loginMessage;
    const timestamp = new Date().getTime().toString();
    const profileImage = constants.loginProfileImage;
    const actions: Action[] = [{ label: "Login" }, { label: "Logout" }];
    const actionCardTitle = "Login";
    const actionCardSubtitle = "Please login to continue";
    
    const handleActionCardClick = (label: string) => {
        if (label === "Login") {
            const loginWindow = window.open(constants.server + "/auth/login", "_blank", "width=600,height=600");
            const handleMessage = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) {
                    return;
                }
                if (event.data === "loginSuccess") {
                    window.removeEventListener("message", handleMessage);
                    localStorage.setItem('authToken', event.data.token);
                    window.location.reload();
                }
            };
            window.addEventListener("message", handleMessage);

            if (loginWindow) {
                loginWindow.focus();
            }

            return () => {
                window.removeEventListener("message", handleMessage);
            };
        } else if (label === "Logout") {
            localStorage.removeItem('authToken');
            window.location.reload();
        }
    };

    return {
        id,
        sender,
        type,
        text,
        timestamp,
        profileImage,
        actions,
        actionCardTitle,
        actionCardSubtitle,
        handleActionCardClick
    } as ChatCardProps;
};

export default LoginCard;
export interface Message {
    annotations?: string[];
    chat_id?: string;
    feedback?: string;
    files?: string[];
    message: string;
    rating?: number;
    session_id?: string;
    sender: string;
    timestamp: string;
    type: string;
};
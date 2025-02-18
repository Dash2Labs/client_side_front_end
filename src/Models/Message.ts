export interface Message {
    speaker: string;
    message: string;
    timestamp: string;
    files?: string[];
    annotations?: string[];
    session_id?: string;
    chat_id?: string;
    feedback?: string;
    rating?: number;
};
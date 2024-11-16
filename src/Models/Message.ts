export interface Message {
    speaker: string;
    message: string;
    timestamp: string;
    files?: string[];
    annotations?: string[];
};
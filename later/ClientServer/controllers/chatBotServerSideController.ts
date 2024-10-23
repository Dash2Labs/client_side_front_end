/*This file is used to make requests to the python server. It is used by the chatbotController.ts file*/
import axios from "axios";

export const askServer = async (question: string, threadId: string | null | undefined, userId: string) => {
    if (!question) {
        console.error("askServer: No question provided");
        return { answer: "Please ask a question", id: "" };
    }

    const defaultThreadId = "default-id";
    const thread_id = threadId && threadId.trim() !== "" ? threadId : defaultThreadId;

    // Encode URI components
    const encodedQuestion = encodeURIComponent(question);

    // Add the body paramaters and headers
    const data = { userId: userId };  // Data to be sent in the request body
    const headers = { "dash2labs-thread-id": thread_id };
    try {
        const response = await axios.post(`${process.env.BASE_URL}/${encodedQuestion}`, data, {
            headers: headers
        });
        return {
            answer: response.data,
            thread_id: response.headers['dash2labs-thread-id'] || thread_id
        };
    } catch (err) {
        console.error("askServer Error:", err);
        return {
            answer: { text: [`Sorry, something went wrong, ${err}`], files: [], annotations: [] },
            thread_id: thread_id
        };
    }
};

export const getHistory = async (userId: string, threadId: string | null) => {
    const defaultThreadId = "default-id";
    const thread_id = threadId && threadId.trim() !== "" ? threadId : defaultThreadId;

    // Add the body paramaters and headers
    const params = { userId: userId };
    const headers = { "dash2labs-thread-id": thread_id };
    const options = { headers: headers, body: params };
    try {
        const response = await axios.get(`${process.env.BASE_URL}/api/history`, options);
        return response.data;
    } catch (err) {
        console.error("getHistory Error:", err);
        return { text: "Sorry, something went wrong getting the history", files: [], annotations: [] };
    }

};

export const cancelQuestion = async () => {
    await fetch("http://localhost:4050/api/cancel");
};

export const handleFeedback = async (req: any, res: any) => { 
    try {
        if (!req.body.feedback) {
            console.error('Feedback property is missing in the request body');
            return res.status(400).json({ success: false, message: 'Feedback property is missing in the request body' });
        }

        type FeedbackSchema = {
            text: string;
            date: Date;
            question: string;
            fid : string;
            response : string;
            responseTime : number;
        };
        
        const feedback: FeedbackSchema = {
            text: req.body.feedback,
            date: new Date(),
            question: req.body.question,
            fid: req.body.feedbackId,
            response: req.body.response,
            responseTime: req.body.responseTime
        };
        const response = await axios.post(`${process.env.BASE_URL}/feedback/submit`, feedback);
        if (response.status === 200) {
            return res.json({ success: true, answer: response.data.answer, id: response.data.id });
        } else {
            console.error('API response status not 200:', response.status, response.statusText);
            return res.status(response.status).json({ success: false, message: response.statusText });
        }
    } catch (error) {
        console.error('Caught error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
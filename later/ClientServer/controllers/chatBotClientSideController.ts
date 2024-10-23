/*The chatbotController queries the python server via the chatApiController for a response and then formats the answer and sends it the front end*/
import { askServer, cancelQuestion, getHistory ,handleFeedback} from "./chatBotServerSideController.js";
import path from "path";
import xss from "xss";

export const chatbot = {
    // This function is called when the user first visits the page
    serve: (PUBLIC_DIR: string) => (req: any, res: { sendFile: (arg0: any) => void; }) => {
        const html = path.join(PUBLIC_DIR, "index.html");
        res.sendFile(html);
    },

    // This function is called when the user asks a question
    ask: async (req: { body: { threadId: string, userId: string, question: string } },
        res: { json: (arg0: { answer: { text: string, files: any[] }; id: string }) => void; }) => {
        console.log("Received question0:", req.body.question, "Thread ID:", req.body.threadId, "User ID:", req.body.userId);
        let question: string = req.body.question;
        let threadId: string | null = req.body.threadId;
        let userId: string = req.body.userId;
        question = xss(question);
        threadId = xss(threadId);
        userId = xss(userId);
        console.log("Received question:", question, "Thread ID:", threadId, "User ID:", userId);
        if (threadId === undefined || threadId === null|| threadId === "") {
            threadId = "default-id";
        }
        if (userId === null || userId === undefined || userId === "") {
            userId = "default-id";
        }
        return askServer(question, threadId, userId)
            .then(async (data) => {
                if (!data || !data.answer || !data.thread_id) {
                    console.error("Received incomplete data from the server:", data);
                    return res.json({
                        answer: {
                            text: "No response or incomplete response from server.",
                            files: []
                        },
                        id: threadId ?? "default-id"  // Provide a default value if threadId is null
                    });
                }

                const { answer, thread_id } = data;

                return res.json({ answer: { text: formatAnswer(answer), files: [] }, id: thread_id })
            })
            .catch(err => {
                console.error("Error during processing request:", err, "Question:", question, "Thread ID:", threadId);
                res.json({ answer: { text: "Sorry, something went wrong asking the server.", files: [] }, id: threadId ?? "undefined" });
            });
    },
    // This function is called when the user cancels a question
    cancelQuestion: async (req: any, res: { json: (arg0: { success: boolean; }) => void; }) => {
        await cancelQuestion();
        res.json({ success: true });
    },
    // This function is called when the user requests the history
    getHistory: async (req: { body: { userId: string; threadId: string | null; }; }, res: { json: (arg0: any) => void; }) => {
        const userId = xss(req.body.userId);
        let threadId: string | null = null;
        if (req.body.threadId !== null && req.body.threadId !== undefined && req.body.threadId !== "") {
            threadId = xss(req.body.threadId);
        }
        return getHistory(userId, threadId)
            .then(data => {
                if (!data || !data.text) {
                    console.error("Received incomplete data from the server:", data);
                    return res.json({ text: "No response or incomplete response from server.", files: [] });
                }
                return res.json(data);
            })
            .catch(err => {
                console.error("Error during processing request:", err, "User ID:", userId, "Thread ID:", threadId);
                res.json({ text: "Sorry, something went wrong getting the history.", files: [] });
            });
    },
    handleFeedback: async (req: any, res: any) => {
        await handleFeedback(req, res).catch((err: any) => {;
            console.error(err);
            res.status(500).json({ success: false });
        });
    },
};



// This function formats the answer from the python server before sending it to the front end
const formatAnswer = (answer: string) => {
    if (typeof answer !== "string") {
        console.error(`Error: answer is not a string it is a ${typeof answer}: ${answer}`);
        return answer;
    }
    // Replace tabs with 4 spaces
    answer = answer.replace(/\t/g, "    ");
    // Replace newlines with <p> tags get rid of empty lines
    answer = answer.split("\n").map((line: string) => line != '' ? `<p>${line}</p>` : '').join("");
    // Replace ** with <b> tags
    let answer_split = answer.split("**")
    for (let i = 1; i < answer_split.length; i += 2) {
        answer_split[i] = `<b>${answer_split[i]}</b>`;
    }
    answer = answer_split.join("");
    return answer;
}
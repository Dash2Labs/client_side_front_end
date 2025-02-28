// Interface defining the structure of a feedback object
export interface FeedbackObject {
    feedback?: string; // The text of the feedback provided by the user
    star?: number; // The star rating provided by the user
    chatId: string; // The ID of the chat 
  }

// Keep in sync with src/Models/Feedback.ts
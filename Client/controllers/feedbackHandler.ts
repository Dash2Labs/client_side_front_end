import axios from 'axios'; // Axios is used for making HTTP requests

// Interface defining the structure of a feedback request
interface FeedbackRequest {
  feedback: string; // The text of the feedback provided by the user
  feedbackId: string; // ID representing the type of feedback (e.g., emoji feedback)
  question: string; // The user's query/question that was answered
  response: string; // The bot's response to the user's query
  responseTime: number; // Time taken by the bot to generate the response (in milliseconds)
}

/**
 * Submits feedback for a specific conversation session.
 * 
 * @param {string} userId - The unique ID of the user providing feedback.
 * @param {string} sessionId - The session ID of the conversation being rated.
 * @param {string} currentTime - The timestamp when feedback is provided.
 * @param {string} feedbackText - The feedback text provided by the user.
 * @param {string} feedbackId - The identifier for the type of feedback (e.g., emoji).
 * @param {string} question - The original question asked by the user.
 * @param {string} response - The response provided by the chatbot to the user's question.
 * @param {number} responseTime - The time taken for the chatbot to respond.
 * @returns {Promise<void>} - A promise that resolves when the feedback submission is complete.
 */
export const submitFeedback = async (
  userId: string, 
  sessionId: string, 
  currentTime: string, 
  feedbackText: string, 
  feedbackId: string, 
  question: string, 
  response: string, 
  responseTime: number
): Promise<void> => {

  // Create the request payload for submitting feedback
  const requestBody: FeedbackRequest = {
    feedback: feedbackText,
    feedbackId: feedbackId,
    question: question,
    response: response,
    responseTime: responseTime,
  };

  let attempt = 0; // Tracks the number of retry attempts made
  const maxRetries = 3; // Maximum number of retries in case of failure

  // Retry logic for submitting feedback to handle network errors
  while (attempt < maxRetries) {
    try {
      // Attempt to submit the feedback using axios
      const response = await axios.post('/api/feedback', requestBody);
      console.log('Feedback submitted successfully:', response.data);
      return; // Exit function on successful submission
    } catch (error) {
      attempt++; // Increment the attempt counter
      console.error(`Error submitting feedback (attempt ${attempt}):`, error); // Log each failed attempt

      // If maximum retries reached, throw an error
      if (attempt >= maxRetries) {
        console.error('Max retries reached. Failed to submit feedback.');
        throw error; // Propagate the error to be handled by the caller
      }

      // Wait for 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

// Exported feedbackHandler object that exposes the main function for submitting feedback
const feedbackHandler = {
  submitFeedback,
};

export default feedbackHandler;

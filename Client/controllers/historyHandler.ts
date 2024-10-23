/**
 * historyHandler Module:
 * @needs a way to parse the history
 * @needs to determine if save with random or logged in user
 * @needs a look over for correctness
 * This module provides functions for saving conversation history, fetching specific session history,
 * and retrieving past conversations for a user. It includes:
 * - saveHistory: Saves conversation history for a session.
 * - getHistory: Retrieves history for a specific session.
 * - getUsersPastConversations: Fetches all session IDs for past user conversations.
 * - needToSave: Checks if the current history needs to be saved.
 */

/**
 * Saves conversation history to the server.
 * @param {string} userId - The ID of the user.
 * @param {string} sessionId - The unique session ID.
 * @param {string} history - The conversation history to save.
 * @returns {Promise<string>} - A promise that resolves to a success or error message.
 */
const saveHistory = async (
  userId: string,
  sessionId: string,
  history: string
): Promise<string> => {
  const requestBody = JSON.stringify({ history });

  // Determines if history needs to be saved before making a network request
  if (needToSave(userId, history)) {
    const request: Request = new Request(`/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
        'sessionId': sessionId,
      },
      body: requestBody,
    });

    let attempt = 0;
    const maxRetries = 3; // Maximum number of retry attempts in case of failure

    // Retry loop for saving history to handle network errors
    while (attempt < maxRetries) {
      try {
        const res = await fetch(request);
        const val = await res.json();
        return val.answer; // Return response from server on success
      } catch (error) {
        attempt++;
        console.error(`Error saving history (attempt ${attempt}):`, error); // Logs each failed attempt

        if (attempt >= maxRetries) {
          alert("Sorry, something went wrong"); // Alerts the user on persistent failure
          return "Could not save history";
        }

        // Waits 1 second before retrying the request
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  return "History not saved"; // Returns message if saving is not needed
};

/**
 * @needs to parse history to organize it for the frontend to display properly???
 * Retrieves conversation history for a specific session.
 * @param {string} sessionId - The unique session ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string>} - A promise that resolves to the session history string.
 */
const getHistory = async (sessionId: string, userId: string): Promise<string> => {
  const request: Request = new Request(`/api/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'userId': userId,
      'sessionId': sessionId,
    },
  });

  let attempt = 0;
  const maxRetries = 3; // Maximum number of retry attempts in case of failure

  // Retry loop for getting history to handle network errors
  while (attempt < maxRetries) {
    try {
      const res = await fetch(request);
      const val = await res.json();
      return val.answer.history; // Returns the fetched session history
    } catch (error) {
      attempt++;
      console.error(`Error getting history (attempt ${attempt}):`, error); // Logs each failed attempt

      if (attempt >= maxRetries) {
        alert("Sorry, something went wrong"); // Alerts the user on persistent failure
        return "Unable to load history";
      }

      // Waits 1 second before retrying the request
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return "Unable to load history"; // Returns message if all retries fail
};

/**
 * Retrieves past conversation session IDs for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} - A promise that resolves to an array of session IDs.
 */
const getUsersPastConversations = async (
  userId: string,
): Promise<string[]> => {
  const request: Request = new Request(`/api/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'userId': userId,
    },
  });

  let attempt = 0;
  const maxRetries = 3;

  // Retry loop for fetching user's past conversations
  while (attempt < maxRetries) {
    try {
      const res = await fetch(request);
      const val = await res.json();
      
      // Check for valid structure before returning
      if (val && val.answer && Array.isArray(val.answer.sessionIds)) {
        return val.answer.sessionIds;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      attempt++;
      console.error(`Error getting history (attempt ${attempt}):`, error);
      
      if (attempt >= maxRetries) {
        console.error("Sorry, something went wrong"); // Log instead of alert
        return []; // Return empty array
      }

      // Waits 1 second before retrying the request
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Fallback return (should never reach here)
  return [];
};


/**
 * Determines if the conversation history needs to be saved.
 * @param {string} userId - The ID of the user.
 * @param {string | null} history - The conversation history.
 * @returns {boolean} - Returns true if the history is valid and needs saving.
 */
const needToSave = (userId: string, history: string | null): boolean => {
  // Returns false if the history is empty or user ID is invalid
  if (history == null || userId == 'null') {
    return false;
  }
  return true; // Otherwise, returns true indicating saving is needed
};

// Exported historyHandler object that exposes the main functions for managing history
const historyHandler = {
  saveHistory,
  getHistory,
  getUsersPastConversations
};

export default historyHandler;

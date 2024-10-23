import SessionHandler from './sessionHandler';

class SessionManager {
  // Static property to store all user sessions
  private static sessions: { [userId: string]: { [sessionId: string]: SessionHandler } } = {};

  /**
   * Private constructor to prevent instantiation.
   * This ensures that `SessionManager` is used as a singleton.
   */
  private constructor() {}

  /**
   * Creates a new session or retrieves an existing session for a user.
   * @param userId - Unique identifier for the user.
   * @param sessionId - Unique session identifier for the session.
   * @returns The `SessionHandler` instance for the specified user and session.
   */
  public static getSession(userId: string, sessionId: string): SessionHandler {
    // Check if the user already has sessions
    if (!this.sessions[userId]) {
      this.sessions[userId] = {};
    }
    
    // Check if the specific session already exists
    if (!this.sessions[userId][sessionId]) {
      // Create a new `SessionHandler` if it doesn't exist
      this.sessions[userId][sessionId] = new SessionHandler(userId, sessionId);
    }

    // Return the `SessionHandler` instance
    return this.sessions[userId][sessionId];
  }

  /**
   * Updates the conversation history for a user's session.
   * @param userId - Unique identifier for the user.
   * @param sessionId - Unique session identifier.
   * @param newHistory - The new conversation to append to the history.
   */
  public static updateSessionHistory(userId: string, sessionId: string, newHistory: string): void {
    // Retrieve the `SessionHandler` and append new history
    const sessionHandler = this.getSession(userId, sessionId);
    sessionHandler.appendHistory(newHistory); // Assuming `SessionHandler` has a method `appendHistory()`
  }

  /**
   * Adds feedback to a user's session.
   * @param userId - Unique identifier for the user.
   * @param sessionId - Unique session identifier.
   * @param feedback - The feedback provided by the user.
   */
  public static addFeedback(userId: string, sessionId: string, feedback: { feedbackText: string; feedbackId: string }): void {
    // Retrieve the `SessionHandler` and add feedback
    const sessionHandler = this.getSession(userId, sessionId);
    sessionHandler.addFeedback(feedback.feedbackText, feedback.feedbackId); // Assuming `SessionHandler` has an `addFeedback()` method
  }

  /**
   * Clears a specific session's data or deletes the session entirely.
   * @param userId - Unique identifier for the user.
   * @param sessionId - Unique session identifier.
   * @param clearOnly - If true, clears the session data; if false, deletes the session.
   */
  public static clearSession(userId: string, sessionId: string, clearOnly: boolean = true): void {
    if (this.sessions[userId] && this.sessions[userId][sessionId]) {
      if (clearOnly) {
        this.sessions[userId][sessionId].clearSessionData(); // Assuming `SessionHandler` has a `clearSessionData()` method
      } else {
        delete this.sessions[userId][sessionId];

        // If the user has no more sessions, remove the user
        if (Object.keys(this.sessions[userId]).length === 0) {
          delete this.sessions[userId];
        }
      }
    }
  }

  /**
   * Retrieves all session IDs for a specific user.
   * @param userId - Unique identifier for the user.
   * @returns An array of session IDs.
   */
  public static getUserSessions(userId: string): string[] {
    return this.sessions[userId] ? Object.keys(this.sessions[userId]) : [];
  }
}

export default SessionManager;

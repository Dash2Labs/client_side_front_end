/**
 * @file Session.ts
 * @description This file contains the Session class which manages user sessions.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { Session } from "../Handlers/Session.ts";
class SessionManager {
    static instance: SessionManager;
    static sessions: Map<string, Session>;
    
    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
            SessionManager.sessions = new Map<string, Session>();
        }
        return SessionManager.instance;
    }

    static getSession(sessionId: string): Session | undefined {
        return SessionManager.sessions.get(sessionId);
    }

    static DeleteExpiredSessions(): void {
        SessionManager.sessions.forEach((session: Session) => {
            if (session.expiresAt.getTime() < Date.now()) {
                SessionManager.sessions.delete(session.session_id);
            }
        });
    }

    static ManageSessions(): void {
        setInterval(SessionManager.DeleteExpiredSessions, 10000);
    }
}

export default SessionManager;
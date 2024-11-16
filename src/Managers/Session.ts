/**
 * @file Session.ts
 * @description This file contains the Session class which manages user sessions.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import Session from "../Handlers/Session.ts";
class SessionManager {
    static instance: SessionManager;
    static sessions: Map<string, Session>;
    static session_timeout: number = 10000;
    
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

    static addSession(session: Session): void {
        SessionManager.sessions.set(session.session_id, session);
    }

    static removeSession(sessionId: string): void {
        const session = SessionManager.sessions.get(sessionId);
        if (session) {
            session[Symbol.dispose]();
        }
        SessionManager.sessions.delete(sessionId);
    }

    static deleteExpiredSessions(): void {
        SessionManager.sessions.forEach((session: Session) => {
            if (session.expiresAt.getTime() < Date.now()) {
                if (session) {
                    session[Symbol.dispose]();
                }
                SessionManager.sessions.delete(session.session_id);
            }
        });
    }

    static ManageSessions(): void {
        setInterval(SessionManager.deleteExpiredSessions, SessionManager.session_timeout);
    }
};

export default SessionManager;
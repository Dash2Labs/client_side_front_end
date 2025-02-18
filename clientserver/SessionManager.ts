import { constants } from "./common_imports.js";

export class SessionManager {
    private static _sessions: Map<string, number> = new Map<string, number>();
    private static _interval: NodeJS.Timeout;

    static {
        this._interval = setInterval(() => {
            this._cleanSessions();
        }, constants.expirationTime);
    }

    public static addActiveSession(session_id: string) {
        this._sessions.set(session_id, Date.now() + constants.expirationTime);
    }

    private static removeActiveSession(session_id: string) {
        this._sessions.delete(session_id);
    }

    public static validActiveSession(session_id: string) {
        if (this._sessions.has(session_id)) {
            if (this._sessions.get(session_id) && this._sessions.get(session_id) as number > Date.now()) {
                return true;
            }
            else {
                this.removeActiveSession(session_id);
                return false;
            }   
        }
        return false;
    }

    public static updateActiveSession(session_id: string): boolean {
        if (this._sessions.has(session_id)) {
            this._sessions.set(session_id, Date.now() + constants.expirationTime);
            return true;
        }
        return false;
    }

    private static _cleanSessions() {
        this._sessions.forEach((value, key) => {
            if (value < Date.now()) {
                this.removeActiveSession(key);
            }
        });
    }
}

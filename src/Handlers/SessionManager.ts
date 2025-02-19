import Session from './Session';
import Communicator from './Communicator.ts';
import { HistoryCard, HistoryCardProps } from 'chatbot-ai-lib';
import { v4 as uuidv4 } from 'uuid';

class SessionManager {
    public activeSessions = {} as Map<string, Session>;
    public activeSessionId: string = "";
    private _communicator: Communicator = new Communicator(uuidv4(), "session_manager");

    /**
     * @description This function validates the session id
     * @param {string} session_id
     */
    public async validActiveSession(session_id: string): Promise<boolean> {
        if (this._sessionInCache(session_id)) {
            const valid = this.activeSessions[session_id].expiresAt > new Date();
            if (!valid) {
                delete this.activeSessions[session_id];
                return new Promise<boolean>((resolve) => resolve(false));
            }
        }
        this._communicator.getRequest(`/session/active/${session_id}`, {}).then((res) => {
            if (res.status !== 200) {
                return false;
            }
        }).catch((error) => {
            console.error("Error validating session: ", error);
            return false;
        });
        this._addLocalActiveSession(session_id);
        return true;
    }

    /**
     * @description This function adds the session to the active sessions
     */
    public addActiveSession(session_id: string) {
        this._communicator.postRequest({}, `/session/active/${session_id}`, {}).then((res) => {
            if (res.status !== 200) {
                console.error("Error adding session: ", res.status);
            }
        }).catch((error) => {
            console.error("Error adding session: ", error);
        });
        this._addLocalActiveSession(session_id);
    }

    /**
     * @description This function gets the session history summary information
     */
    public async getSessionHistorySummaries() {
        return this._communicator.getRequest(`/session/history`, {}).then((res) => {
            if (res.status !== 200) {
                console.error("Error getting session history: ", res.status);
            } else {
                return res.data as HistoryCardProps[];
            }
        }).catch((error) => {         
            console.error("Error getting session history: ", error);
        });
    }

    /**
     * @description This function adds the session to the local active sessions
     * @param {string} session_id
     */
    private _addLocalActiveSession(session_id: string) {
        this.activeSessions[session_id] = new Session(this, session_id);
    }

    /**
     * @description This function checks if the session is in the cache
     * @param {string} session_id
     */
    private _sessionInCache(session_id: string): boolean {
        return this.activeSessions.has(session_id);
    }
}

export default SessionManager;
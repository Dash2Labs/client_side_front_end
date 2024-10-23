import { EventEmitter } from "events";
import Session from "./Session.ts";
import SessionManager from "../Managers/Session.ts";

/**
 * @description This is the HandleSignIn class which handles the user sign in and sign out
 * @works with the Session class to handle the user session and the sessionManager to manage the sessions
 * @extends EventEmitter
 * @def _session_id is the session id that is used to identify the session
 * @def _session is the session object that is used to handle the user session
 * @calls getSessionFromCookie to get the session id from the cookie
 * @calls setSessionCookie to set the session id in the cookie
 * @calls signIn to sign the user in
 * @calls signOut to sign the user out
 */

class HandleSignIn extends EventEmitter {
    private _session_id!: string;
    private _session?: Session;

    constructor() {
        super();
        this._session_id = this.getSessionFromCookie();
    }

    public signIn() {
        if (!this._session) {
                this._session = new Session(this._session_id);
                if (this._session) {
                    this._session_id = this._session.session_id;
                    SessionManager.addSession(this._session);
                }
        }
        this.emit("signedIn", this._session);
    }

    public signOut() {
        if (this._session) {
            SessionManager.removeSession(this._session_id);
            this.setSessionCookie(this._session_id);
            this._session = undefined;
            this._session_id = "";  
            this.emit("signedOut", this._session);
        }
    }

    private getSessionFromCookie(): string {
        const defaultSessionId = "e7b8a6d4-3f2a-4b8a-9f3b-2d6a8e4f9c3e";
        return defaultSessionId; //TODO: get session id from cookie
    }

    private setSessionCookie(session_id: string) {
    }

    public get session_id(): string {
        return this._session_id;
    }

    public set session_id(session_id: string) {
        this._session_id = session_id;
    }

    public get session(): Session | undefined {
        return this._session;
    }

    public set session(session: Session | undefined) {
        this._session = session;
    }
}

export default HandleSignIn
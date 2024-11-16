import { EventEmitter } from "events";
import Session from "./Session.ts";
import xss from "xss";
import { constants } from "../constants.js";
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
        this._session_id = this._getSessionFromCookie();
    }

    /**
     * @description This function signs the user in
     * @returns void
     * @emits signedIn event
     * @calls addSession to add the session to the session manager
     * @calls new Session to create a new session
     */
    public signIn() {
        if (!this._session) {
                this._session = new Session(this._session_id);
                if (this._session) {
                    this._session_id = this._session.session_id;
                    this._setSessionCookie(this._session_id);
                }
        }
        this.emit("signedIn", this._session);
    }

    /**
     * @description This function signs the user out
     * @returns void
     * @emits signedOut event
     * @calls removeSession to remove the session from the session manager
     * @calls setSessionCookie to set the session id in
     */
    public signOut() {
        if (this._session) {
            this._removeSessionCookie(this._session_id);
            this._session = undefined;
            this._session_id = "";  
            this.emit("signedOut", this._session);
        }
    }

    /**
     * @method _getSessionFromCookie
     * @description This function gets the session id from the cookie
     * @returns the session id from the cookie
     */
    private _getSessionFromCookie(): string {
        const defaultSessionId = "e7b8a6d4-3f2a-4b8a-9f3b-2d6a8e4f9c3e";
        const name = "session_id=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            const cookie = cookieArray[i].trim();
            // check for xss
            if (cookie.indexOf(name) === 0 && JSON.stringify(cookie).length !== xss(JSON.stringify(cookie)).length) {
                return defaultSessionId;
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return defaultSessionId; // Return default session id if not found
    }

    /**
     * @method _setSessionCookie
     * @description This function sets the session id in the cookie
     * @param session_id 
     * @returns void
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _setSessionCookie(session_id: string) {
        const cookieName = "session_id";
        const expires = new Date();
        expires.setTime(expires.getTime() + constants.expirationTime + 10000);
        const cookieValue = `${cookieName}=${session_id}; expires=${expires.toUTCString()}; path=/`;
        document.cookie = cookieValue;
    }

    /**
     * @method _removeSessionCookie
     * @description This function removes the session id from the cookie
     * @param session_id 
     * @returns void
     */
    private _removeSessionCookie(session_id: string) {
        const cookieName = "session_id";
        const expires = new Date();
        expires.setTime(expires.getTime() - 10000);
        const cookieValue = `${cookieName}=${session_id}; expires=${expires.toUTCString()}; path=/`;
        document.cookie = cookieValue;
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
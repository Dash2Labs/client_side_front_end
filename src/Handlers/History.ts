/**
 * @file Session.ts
 * @description This file contains the Session class which handles history of user sessions.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

class History {
    private _session_id!: string;
    private _user_id!: string;

    constructor(session_id: string, user_id: string) {
        this._session_id = session_id;
        this._user_id = user_id;
    }
}

export default History;
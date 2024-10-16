/**
 * @file User.ts
 * @description This file contains the Users class which contains the user information.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { v4 as uuidv4 } from 'uuid';
import { getMyId, getProfile } from '../Authorization/Msgraph.ts';
import AuthorizationError from '../Authorization/Errors/AuthorizationError.js';

class User {
    private _user_id?: string = "";
    private _photo?: string = "";

    constructor(anonymous: boolean = false) {
        this.initialize(anonymous);
    }

    private async initialize(anonymous: boolean) {
        if (!anonymous) {
            this._user_id = await getMyId();
            if (!this._user_id) {
                throw new AuthorizationError("User not authorized");
            }
            this._photo = await getProfile(null);
        } else {
            this._user_id = uuidv4();
        }
    }
    
    get user_id(): string | undefined {
        return this._user_id || undefined;
    }   
    set user_id(user_id: string) {
        this._user_id = user_id;
    }
    get photo(): string | undefined {
        return this._photo;
    }
    set photo(photo: string) {
        this._photo = photo;
    }

    [Symbol.dispose]() {
    }
};

class NewUser {
    private _username: string = "";
    private _email: string = "";
    private _password: string = "";

    get username(): string {
        return this._username;
    }
    set username(username: string) {
        this._username = username;
    }
    get email(): string {
        return this._email;
    }
    set email(email: string) {
        this._email = email;
    }
    get password(): string {
        return this._password;
    }
    set password(password: string) {
        this._password = password;
    }
};

export default User;
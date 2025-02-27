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
import AuthorizationError from '../Authorization/Errors/AuthorizationError.ts';
import { constants } from '../constants.js';

/**
 * @class User
 * @description Contains the user information.
 * @property {string} _user_id - The user's unique identifier.
 * @property {string} _photo - The user's photo.
 */
class User {
    private _userId?: string = "";
    private _photo?: string = "";
    private _userName?: string = "";

    constructor(anonymous: boolean = false) {
        this._initialize(anonymous);
    }

    /**
     * @method _initialize
     * @description Initializes the user object.
     * @param {boolean} anonymous - Indicates if the user is anonymous.
     * @throws {AuthorizationError} - Throws an error if the user is not authorized.
     * @returns {Promise<void>} - A promise that resolves when the user object is initialized.
     */
    private async _initialize(anonymous: boolean) {
        if (!anonymous) {
            this._userId = await getMyId();
            if (!this._userId) {
                throw new AuthorizationError("User not authorized");
            }
            this._photo = await getProfile(null);
            this._userName = await getProfile("displayName");
        } else {
            this._userId = ["A-", uuidv4()].join("");
            this._userName = "Guest";
            this._photo = constants.defaultProfileImage;
        }
    }
    
    get userName(): string | undefined {
        return this._userName || undefined;
    }
    get userId(): string | undefined {
        return this._userId || undefined;
    }   
    set userId(userId: string) {
        this._userId = userId;
    }
    get photo(): string | undefined {
        return this._photo;
    }
    set photo(photo: string) {
        this._photo = photo;
    }

    [Symbol.dispose](): void {
    }
};

// eslint-disable-next-line
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
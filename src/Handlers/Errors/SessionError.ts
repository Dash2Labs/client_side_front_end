/**
 * @file SessionError.ts
 * @description This file contains the SessionError class which handles session errors.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

class SessionError extends Error {
    constructor(message: string) {
        super(message);
    }
};

export default SessionError;
/**
 * @file AuthorizationError.ts
 * @description This file contains the AuthorizationError class which handles authorization errors.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

class AuthorizationError extends Error {
    constructor(message: string) {
        super(message);
    }
};

export default AuthorizationError;
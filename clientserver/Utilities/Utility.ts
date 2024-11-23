/**
 * @file Utility.ts
 * @description This file contains utility functions for the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

/**
 * @function getSizeInBytes
 * @param {object} object 
 * @returns {number} the size of the object in bytes
 */
export const getSizeInBytes = (object: object): number => {
    if (object === null || object === undefined) {
        return 0;
    }
    return Buffer.byteLength(JSON.stringify(object), 'utf8');
};
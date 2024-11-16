import { Buffer } from 'buffer';

export const getSizeInBytes = (object: object): number => {
    return Buffer.byteLength(JSON.stringify(object), 'utf8');
};
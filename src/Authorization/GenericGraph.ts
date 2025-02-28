/**
 * @file GenericGraph.ts
 * @description This file selects which authprovider to use based on the environment.
 * @version 1.0.0
 * @date 2025-02-26
 * 
 * @author Dustin Morris
 */
import { getMyId, getProfile, getAccessToken } from "./Msgraph.ts";
import { msalInstance } from './MsalInstance.ts';
import  { constants } from '../constants.js';

interface AuthExports {
    getMyId: () => string | undefined;
    getProfile: (accessToken: string | null) => Promise<any>;
    ssoInstance: any;
    getAccessToken: () => Promise<any>;
}

let exprts: AuthExports;
if (true || constants.useAzure) {
    exprts = { getMyId, getProfile, ssoInstance: msalInstance, getAccessToken };
}

export default exprts;



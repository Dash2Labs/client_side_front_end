/**
 * @file MsalInstance.ts
 * @description 
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./Config.js";

export const msalInstance = new PublicClientApplication(msalConfig);
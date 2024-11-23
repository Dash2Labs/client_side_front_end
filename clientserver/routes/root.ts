/**
 * @file root.ts
 * @description This file contains the root route which serves the index.html file.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import { express, resolvePath } from '../common_imports.ts';

const root = express.Router();
root.get('/', (req, res) => {
    res.sendFile(resolvePath('@public/index.html'));
});
export default root;
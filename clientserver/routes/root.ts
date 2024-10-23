import { express, resolvePath } from '../common_imports.js';

const root = express.Router();
root.get('/', (req, res) => {
    res.sendFile(resolvePath('@public/index.html'));
});
export default root;
import expressStaticGzip, { ExpressStaticGzipOptions } from 'express-static-gzip';
import { Request, Response, NextFunction } from 'express';

interface ExtendedOptions extends ExpressStaticGzipOptions {
    setHeaders?: (res: Response, path: string, stat: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const serveStatic = (other: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const options: ExtendedOptions = {
        enableBrotli: true,
        orderPreference: ['br', 'gz'],
        setHeaders: (res) => {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        },
    };

    other.forEach((dir) => {
        expressStaticGzip(dir, options)(req, res, next);
    });
};

export default serveStatic;
import expressStaticGzip, { ExpressStaticGzipOptions } from 'express-static-gzip';
import { Request, Response, NextFunction } from 'express';

interface ExtendedOptions extends ExpressStaticGzipOptions {
    setHeaders?: (res: Response, path: string, stat: any) => void;
}

export const serveStatic = (PUBLIC_DIR: string, ...other: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const options: ExtendedOptions = {
        enableBrotli: true,
        orderPreference: ['br', 'gz'],
        setHeaders: (res) => {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        },
    };

    expressStaticGzip(PUBLIC_DIR, options)(req, res, next);
};

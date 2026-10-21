import {type Request, type Response, type NextFunction} from 'express';
import {type ZodType, ZodError} from 'zod';
import {AppError} from '../errors/AppError.ts';

export const validateRequest = (schema: ZodType) => async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        }) as {body?: Request['body']; query?: Request['query']; params?: Request['params']};

        req.body = parsed.body;
       
        Object.defineProperty(req, 'query', {value: parsed.query, writable: true, configurable: true, enumerable: true});
        req.params = parsed.params as Request['params'];
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors: Record<string, string[]> = {};

            error.issues.forEach((issue) => {
                const path = issue.path.join('.').replace(/^(body|query|params)\./, '');
                const field = path || 'general';
                (formattedErrors[field] ??= []).push(issue.message);
            });
            return next(new AppError('Error de validación', 400, false, formattedErrors));
        }
        next(error);
    }
};

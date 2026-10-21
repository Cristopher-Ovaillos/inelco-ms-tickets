import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../../config/index.ts';

// compara en tiempo constante (hash previo para igualar largos)
const safeEqual = (a: string, b: string): boolean => {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

// Basic Auth con credenciales de SWAGGER_USER / SWAGGER_PASSWORD (env)
export const swaggerAuth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization ?? '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    const user = decoded.slice(0, sep);
    const password = decoded.slice(sep + 1);

    if (sep >= 0 && safeEqual(user, config.swagger.user) && safeEqual(password, config.swagger.password)) {
      next();
      return;
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Documentacion API"');
  res.status(401).send('Autenticacion requerida');
};

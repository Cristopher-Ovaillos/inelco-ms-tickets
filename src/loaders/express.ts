// recibimos la instancia de express y aplicamos politicas globales de seguridad, parsing de json y rutas basicas

import express, {type Application} from 'express'; // Application es un tipo y hay que importarlo coo tipo.Esto por la config en tsconfig.json lo de verbatimmodulesyntax true

import cors from 'cors'; 

import helmet from 'helmet'; //configuracion de encabezados

import rateLimit from 'express-rate-limit';

import {config} from '../config/index.ts';

//()=>{}
export  const expressLoader = ({app}: {app: Application}) : void =>{
    //ocultar header  'X-Powered-By' por seguridad
    app.disable('x-powered-by');
    //headers http seguras contra xss etc
    //sin upgrade-insecure-requests fuera de produccion, si no algunos navegadores piden /api-docs por https y no carga
    app.use(helmet(config.nodeEnv === 'production' ? undefined : {
        contentSecurityPolicy: {useDefaults: true, directives: {'upgrade-insecure-requests': null}},
    }));
    //control de acceso HTTP cors
    app.use(cors());

    //parsea peticiones con payload json y urlencoded
    app.use(express.json({limit: '10mb'}));
    app.use(express.urlencoded({extended: true}));
    //limitador de peticiones para prevenir ataques de fuerza bruta
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        limit: 100, // max de peticiones por ventana (windowMs) y por IP
        standardHeaders: true, // devuelve info de limitacion en headers
        legacyHeaders: false, // desactiva los headers X-RateLimit-* antiguos
        message: {status: 429, message: 'Demasiadas peticiones, por favor intente mas tarde.'},
    });

    app.use(config.api.prefix, limiter);

    // endpoint de healthcheck
    app.get('/health', (_req, res) => {
        res.status(200).json({status: 'ok',timestamp: new Date().toISOString()});
    });
}



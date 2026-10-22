import { config } from '../../config/index.ts';
import { logger } from '../../loaders/logger.ts';

export interface Clima {
    temperatura_c: number;
    humedad_pct: number;
    viento_kmh: number;
    medido_en: string;
}

interface RespuestaOpenMeteo {
    current: {
        time: string;
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
    };
}

// si falla o tarda devolvemos null y la consulta se crea igual
export const obtenerClima = async (latitud: number, longitud: number): Promise<Clima | null> => {
    const url = new URL(config.clima.url);
    url.searchParams.set('latitude', String(latitud));
    url.searchParams.set('longitude', String(longitud));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m');

    try {
        const respuesta = await fetch(url, { signal: AbortSignal.timeout(config.clima.timeoutMs) });
        if (!respuesta.ok) throw new Error(`open-meteo respondio ${respuesta.status}`);

        const { current } = (await respuesta.json()) as RespuestaOpenMeteo;
        return {
            temperatura_c: current.temperature_2m,
            humedad_pct: current.relative_humidity_2m,
            viento_kmh: current.wind_speed_10m,
            medido_en: current.time,
        };
    } catch (error) {
        logger.warn({ err: error }, 'no se pudo obtener el clima, se sigue sin el');
        return null;
    }
};

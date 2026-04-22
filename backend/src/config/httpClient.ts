import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Crée une instance Axios avec un timeout fixé et un intercepteur d'erreur
 * qui loggue les timeouts de façon lisible.
 */
const createHttpClient = (timeout: number): AxiosInstance => {
  const client = axios.create({ timeout });

  client.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.code === 'ECONNABORTED') {
        const url = error.config?.url ?? 'URL inconnue';
        console.error(`⏱️  Timeout (${timeout}ms) sur : ${url}`);
        throw new Error(`Timeout : la requête vers ${url} a dépassé ${timeout / 1000}s`);
      }
      throw error;
    }
  );

  return client;
};

/** Client Spotify — timeout 8 s */
export const spotifyClient = createHttpClient(8_000);

/** Client Deezer — timeout 10 s */
export const deezerClient = createHttpClient(10_000);

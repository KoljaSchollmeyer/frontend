import axios from 'axios'

/**
 * Konfiguration der Axios-Instanz.
 * - baseURL: Nutzt die Umgebungsvariable oder einen Fallback für Proxies.
 * - withCredentials: Stellt sicher, dass Cookies (für Sessions) mitgesendet werden.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
})

export const api = {
  // --- Generische HTTP-Methoden ---

  /**
   * Führt einen GET-Request aus und gibt direkt die Daten zurück.
   * T: Der erwartete Rückgabetyp der Antwort.
   */
  get: async <T>(url: string, params?: Record<string, unknown>) => 
    (await client.get(url, { params })).data as T,
  
  /**
   * Führt einen POST-Request aus.
   * body: Die zu sendenden Daten (Typ unknown für maximale Flexibilität).
   */
  post: async <T>(url: string, body: unknown) => 
    (await client.post(url, body)).data as T,
  
  /**
   * Führt einen DELETE-Request aus.
   */
  delete: async (url: string) => client.delete(url),
  
  // --- Authentifizierung ---
  
  /**
   * Loggt den Benutzer ein.
   */
  login: (data: unknown) => client.post('/auth/login', data).then(r => r.data),

  /**
   * Registriert einen neuen Benutzer.
   */
  register: (data: unknown) => client.post('/auth/register', data).then(r => r.data),
  
  /**
   * Loggt den Benutzer aus (löscht Session/Cookie).
   */
  logout: () => client.post('/auth/logout'),

  /**
   * Prüft den aktuellen Login-Status.
   * Gibt die Benutzerdaten zurück oder null, falls nicht eingeloggt.
   * Fehler werden abgefangen, um den Fluss nicht zu unterbrechen.
   */
  session: () => client.get('/auth/me').then(r => r.data).catch(() => null)
}
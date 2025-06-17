// services/index.js (o services/codes.js según tu estructura)
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// URLs base para producción y sandbox. Ajusta si tu endpoint difiere ligeramente.
const PUBLIC_HOST =
  "https://m3xrpgk8ld.execute-api.us-west-2.amazonaws.com/public";
const SANDBOX_HOST =
  "https://m3xrpgk8ld.execute-api.us-west-2.amazonaws.com/publicSandbox";

// Clave en AsyncStorage para almacenar si estamos en sandbox
const SANDBOX_MODE_KEY = "sandboxMode";

/**
 * Obtiene el estado de sandbox desde AsyncStorage.
 * @returns {Promise<boolean>} true si está en sandbox, false en caso contrario (o si no hay valor).
 */
export const isSandboxMode = async () => {
  try {
    const stored = await AsyncStorage.getItem(SANDBOX_MODE_KEY);
    return stored === "true";
  } catch (error) {
    console.error("Error leyendo sandboxMode:", error);
    return false;
  }
};

/**
 * Activa o desactiva el modo sandbox.
 * @param {boolean} enabled - true para activar sandbox, false para desactivar.
 * @returns {Promise<void>}
 */
export const setSandboxMode = async (enabled) => {
  try {
    await AsyncStorage.setItem(SANDBOX_MODE_KEY, enabled ? "true" : "false");
    console.log(`Sandbox mode ${enabled ? "activado" : "desactivado"}`);
  } catch (error) {
    console.error("Error guardando sandboxMode:", error);
    throw error;
  }
};

/**
 * Determina dinámicamente el host base según sandboxMode.
 * @returns {Promise<string>} URL base para llamadas axios.
 */
const getServicesHost = async () => {
  const sandbox = await isSandboxMode();
  return sandbox ? SANDBOX_HOST : PUBLIC_HOST;
};

export const deleteCache = async () => {
  try {
    await AsyncStorage.removeItem("categories");
    await AsyncStorage.removeItem("categoriesTimestamp");
    await AsyncStorage.removeItem("lastGame");
    await AsyncStorage.removeItem("currentCard");
    await AsyncStorage.removeItem("generationHistory");
    await AsyncStorage.removeItem("playerList");

    console.log("Cache de categorías eliminado.");
  } catch (error) {
    console.error("Error al eliminar cache de categorías:", error);
  }
};

/**
 * Ejemplo: obtiene todas las categorías, con caching en AsyncStorage.
 */
export const getAllCategories = async () => {
  try {
    const CATEGORY_STORAGE_KEY = "categories";
    const TIMESTAMP_STORAGE_KEY = "categoriesTimestamp";
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const now = Date.now();

    // Verificar cache
    const storedCategories = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
    const storedTimestamp = await AsyncStorage.getItem(TIMESTAMP_STORAGE_KEY);

    if (storedCategories && storedTimestamp) {
      const age = now - parseInt(storedTimestamp, 10);
      if (age < TWELVE_HOURS) {
        return JSON.parse(storedCategories);
      }
    }

    // Llamada real
    const host = await getServicesHost();
    const results = await axios.get(`${host}/categories/`);
    const categories = results.data;

    // Guardar cache
    await AsyncStorage.setItem(
      CATEGORY_STORAGE_KEY,
      JSON.stringify(categories)
    );
    await AsyncStorage.setItem(TIMESTAMP_STORAGE_KEY, now.toString());

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Genera un juego (ya existente).
 */
export const generateGame = async (body) => {
  const host = await getServicesHost();
  const results = await axios.post(`${host}/generateGame`, body);
  return results.data;
};

/**
 * Genera un juego de historia (ya existente).
 */
export const generateStoryGame = async (body) => {
  const host = await getServicesHost();
  const results = await axios.post(`${host}/generateStoryGame`, body);
  return results.data;
};

/**
 * Obtiene un script por código (ya existente).
 */
export const getScript = async ({ code }) => {
  console.log("getScript code", code);
  const host = await getServicesHost();
  const results = await axios.get(`${host}/script/${code}`);
  return results.data;
};

/**
 * Genera un script (ya existente).
 */
export const generateScript = async (body) => {
  const host = await getServicesHost();
  const results = await axios.post(`${host}/generateScript`, body);
  return results.data;
};

/**
 * Verifica un código. Debes tener un endpoint en tu backend, por ejemplo POST /validateCode
 * que reciba { code } y devuelva { result: "error"|"promo"|"admin" }.
 * Ajusta la ruta si tu API difiere (p.ej. `/codes/validate`, `/validate-code`, etc.).
 * @param {string} code
 * @returns {Promise<"error"|"promo"|"admin">}
 */
export const validateCode = async (code) => {
  try {
    const host = await getServicesHost();
    // Ajusta la ruta: aquí suponemos POST /validateCode
    console.log("Validando código:", host);
    const res = await axios.post(`${host}/validateCode`, { code });
    // Asegúrate que tu backend devuelve { result: "error" } o similar
    if (res.data && typeof res.data.result === "string") {
      return res.data.result;
    } else {
      console.warn("validateCode: formato inesperado de respuesta", res.data);
      throw new Error("Respuesta inesperada al validar código");
    }
  } catch (error) {
    console.error("Error en validateCode:", error);
    // Re-lanzar o convertir a un string de error genérico según convenga
    throw error;
  }
};

export const versionCheck = async () => {
  try {
    const version = 1;
    const host = await getServicesHost();
    const res = await axios.post(`${host}/version`, { version });
    if (res.data && typeof res.data.result === "string") {
      return res.data.result;
    } else {
      console.warn("version: formato inesperado de respuesta", res.data);
      throw new Error("Respuesta inesperada al validar código");
    }
  } catch (error) {
    console.error("Error en versionCheck:", error);
    // Re-lanzar o convertir a un string de error genérico según convenga
    throw error;
  }
};

/**
 * Otras posibles llamadas relacionadas a sandbox:
 * - p. ej. si necesitas llamar a un endpoint para notificar al backend que cambiaste de sandbox,
 *   podrías hacer aquí otro método. Pero normalmente basta con cambiar la base URL.
 *
 * Ejemplo de un endpoint para notificar al servidor (opcional):
 * export const notifySandboxModeChange = async (enabled) => {
 *   try {
 *     const host = await getServicesHost();
 *     // Supón que tu backend tiene una ruta POST /sandboxMode que recibe { enabled }
 *     const res = await axios.post(`${host}/sandboxMode`, { enabled });
 *     return res.data;
 *   } catch (error) {
 *     console.error("Error notificando cambio de sandbox al servidor:", error);
 *     throw error;
 *   }
 * };
 */

/**
 * Ejemplo de uso de setSandboxMode en tu componente:
 *
 * // Al activar/desactivar sandbox:
 * await setSandboxMode(true); // o false
 * // Luego, futuras llamadas a validateCode(), getAllCategories(), etc., usarán la ruta sandbox o pública.
 *
 * // Si deseas que el cambio de sandbox provoque recarga de datos o navegación:
 * //   - puedes invalidar caches guardados (p.ej., borrar keys de AsyncStorage de categorías)
 * //   - volver a fetch de datos con la nueva ruta
 * //   - reiniciar navegación o forzar refetch en pantallas relevantes.
 */

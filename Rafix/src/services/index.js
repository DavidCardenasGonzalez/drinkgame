import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICES_HOST =
  "https://m3xrpgk8ld.execute-api.us-west-2.amazonaws.com/public";

export const getAllCategories = async () => {
  try {
    const CATEGORY_STORAGE_KEY = "categories";
    const TIMESTAMP_STORAGE_KEY = "categoriesTimestamp";
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const now = Date.now();
    const storedCategories = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
    const storedTimestamp = await AsyncStorage.getItem(TIMESTAMP_STORAGE_KEY);

    if (storedCategories && storedTimestamp) {
      const age = now - parseInt(storedTimestamp, 10);

      if (age < TWELVE_HOURS) {
        // Si los datos no tienen más de 12 horas, devolverlos
        return JSON.parse(storedCategories);
      }
    }

    // Si no hay datos o son viejos, hacer la llamada a la API
    const results = await axios.get(`${SERVICES_HOST}/categories/`);
    const categories = results.data;

    // Almacenar los nuevos datos y su timestamp en AsyncStorage
    await AsyncStorage.setItem(
      CATEGORY_STORAGE_KEY,
      JSON.stringify(categories)
    );
    await AsyncStorage.setItem(TIMESTAMP_STORAGE_KEY, now.toString());

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Puedes manejar el error de manera más específica según sea necesario
  }
};

export const generateGame = async (body) => {
  const results = await axios.post(`${SERVICES_HOST}/generateGame`, body);
  return results.data;
};

export const generateStoryGame = async (body) => {
  const results = await axios.post(`${SERVICES_HOST}/generateStoryGame`, body);
  return results.data;
};

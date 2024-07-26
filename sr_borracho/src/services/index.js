import axios from 'axios';

const SERVICES_HOST = 'https://m3xrpgk8ld.execute-api.us-west-2.amazonaws.com/public';

export const getAllCategories = async () => {
  const results = await axios.get(`${SERVICES_HOST}/categories/`);
  return results.data;
};

export const generateGame = async (body) => {
  const results = await axios.post(`${SERVICES_HOST}/generateGame`, body);
  return results.data;
};

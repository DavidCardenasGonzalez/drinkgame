import axios from 'axios';

const SERVICES_HOST = 'https://m3xrpgk8ld.execute-api.us-west-2.amazonaws.com';

export const getAllCategories = async () => {
  const results = await axios.get(`${SERVICES_HOST}/public/categories/`);
  return results.data;
};

export const getEmployees = async (id) => {
  const results = await axios.get(`${SERVICES_HOST}/employees/${id}`);
  return results.data;
};
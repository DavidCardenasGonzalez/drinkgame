import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { Auth } from 'aws-amplify';

const SERVICES_HOST = window.appConfig.apiEndpoint;
let client;

/* eslint-disable no-console */

const getAuthHeader = (session) => `Bearer ${session.getAccessToken().getJwtToken()}`;

// Handle token refreshing
const createAPIClient = async () => {
  const session = await Auth.currentSession();
  client = axios.create({
    headers: {
      common: {
        Authorization: getAuthHeader(session),
      },
    },
  });
  createAuthRefreshInterceptor(client, async (request) => {
    // Recreate client and update for future requests
    await createAPIClient();
    const newSession = await Auth.currentSession();
    // Update the Auth header for current request
    request.response.config.headers.Authorization = getAuthHeader(newSession);
  });
};

// Users

let userProfileData;

export const getAllUsers = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/users/`);
  return results.data.users;
};

export const createNewUser = async (email, name, group) => {
  if (!client) {
    await createAPIClient();
  }
  const body = { email, name, group };
  await client.post(`${SERVICES_HOST}/users/`, body);
};

export const deleteUser = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  await client.delete(`${SERVICES_HOST}/users/${id}`);
};

export const getAllUserProfiles = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/users/profiles`);
  return results.data.users;
};

export const getProfileData = async (userId, forceRefresh = false) => {
  if (!userProfileData || forceRefresh) {
    userProfileData = await getAllUserProfiles();
  }
  const user = userProfileData.find((u) => u.userId === userId);
  return user;
};

export const getCurrentUserProfile = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/users/profile`);
  return results.data.user;
};

export const updateCurrentUserProfile = async (name, shouldDeletePicture, picture) => {
  if (!client) {
    await createAPIClient();
  }
  const formData = new FormData();
  if (name) {
    formData.append('name', name);
  }
  if (shouldDeletePicture) {
    formData.append('deletePicture', true);
  }
  if (picture) {
    formData.append('picture', picture);
  }
  const results = await client.patch(`${SERVICES_HOST}/users/profile`, formData);
  return results.data.user;
};

// Employees ----------------------------------------

export const createEmployeee = async (body) => {
  if (!client) {
    await createAPIClient();
  }
  await client.post(`${SERVICES_HOST}/employees/`, body);
};

export const getAllEmployees = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/employees/`);
  return results.data;
};

export const getEmployees = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/employees/${id}`);
  return results.data;
};

// Categories ----------------------------------------

export const createCategory = async (body) => {
  if (!client) {
    await createAPIClient();
  }
  await client.post(`${SERVICES_HOST}/categories/`, body);
};

export const getAllCategories = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/categories/`);
  return results.data;
};

export const getCategory = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/categories/${id}`);
  return results.data;
};

export const updateCategoryProfile = async (PK, status, shouldDeletePicture, picture, type) => {
  if (!client) {
    await createAPIClient();
  }
  const formData = new FormData();
  if (PK) {
    formData.append('PK', PK);
  }
  if (status) {
    formData.append('status', status);
  }
  if (shouldDeletePicture) {
    formData.append('deletePicture', true);
  }
  if (picture) {
    formData.append('picture', picture);
  }
  if (type) {
    formData.append('type', type);
  }
  const results = await client.patch(`${SERVICES_HOST}/categories/actions/updatePicture`, formData);
  return results.data.user;
};

export const simulateCategory = async (body) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/categories/actions/simulate`, body);
  return results.data;
};

// Cards ----------------------------------------

export const createCard = async (body) => {
  if (!client) {
    await createAPIClient();
  }
  await client.post(`${SERVICES_HOST}/cards/`, body);
};

export const getAllCards = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/cards/`);
  return results.data;
};

export const getCategoryCards = async (categoryId) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/cards/category/${categoryId}`);
  return results.data;
};

export const getCard = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/cards/${id}`);
  return results.data;
};

export const updateCardProfile = async (PK, categoryId, shouldDeletePicture, picture, type) => {
  if (!client) {
    await createAPIClient();
  }
  const formData = new FormData();
  if (PK) {
    formData.append('PK', PK);
  }
  if (categoryId) {
    formData.append('categoryId', categoryId);
  }
  if (shouldDeletePicture) {
    formData.append('deletePicture', true);
  }
  if (picture) {
    formData.append('picture', picture);
  }
  if (type) {
    formData.append('type', type);
  }
  const results = await client.patch(`${SERVICES_HOST}/cards/actions/updatePicture`, formData);
  return results.data.user;
};

/* eslint-enable no-console */

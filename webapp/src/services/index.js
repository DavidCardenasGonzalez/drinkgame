import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { Auth } from 'aws-amplify';

// eslint-disable-next-line no-undef
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

export const createStory = async (body) => {
  if (!client) {
    await createAPIClient();
  }
  await client.post(`${SERVICES_HOST}/stories/`, body);
};

export const getAllStories = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/stories/`);
  return results.data;
};

export const getStory = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/stories/${id}`);
  return results.data;
};

export const deleteStory = async (id) => {
  console.log('deleteStory', id);
  if (!client) {
    await createAPIClient();
  }
  await client.delete(`${SERVICES_HOST}/stories/${id}`);
};

export const updateStoryProfile = async (PK, status, shouldDeletePicture, picture, type) => {
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
  const results = await client.patch(`${SERVICES_HOST}/stories/actions/updatePicture`, formData);
  return results.data.user;
};

export const simulateStory = async (body) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/stories/actions/simulate`, body);
  return results.data;
};

export const getCategory = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/categories/${id}`);
  return results.data;
};

export const deleteCategory = async (id) => {
  console.log('deleteCard', id);
  if (!client) {
    await createAPIClient();
  }
  await client.delete(`${SERVICES_HOST}/categories/${id}`);
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

export const deleteCard = async (id, categoryId) => {
  console.log('deleteCard', id);
  if (!client) {
    await createAPIClient();
  }
  await client.delete(`${SERVICES_HOST}/cards/${id}/category/${categoryId}`);
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

// StoryNodes ----------------------------------------

export const createStoryNode = async (body) => {
  if (!client) {
    await createAPIClient();
  }
  await client.post(`${SERVICES_HOST}/storyNodes/`, body);
};

export const getAllStoryNodes = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/storyNodes/`);
  return results.data;
};

export const getStoryStoryNodes = async (storyId) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/storyNodes/story/${storyId}`);
  return results.data;
};

export const getStoryNode = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/storyNodes/${id}`);
  return results.data;
};

export const deleteStoryNode = async (id, storyId) => {
  console.log('deleteStoryNode', id);
  if (!client) {
    await createAPIClient();
  }
  await client.delete(`${SERVICES_HOST}/storyNodes/${id}/story/${storyId}`);
};

// eslint-disable-next-line max-len
export const updateStoryNodeProfile = async (PK, storyId, shouldDeletePicture, picture, type) => {
  if (!client) {
    await createAPIClient();
  }
  const formData = new FormData();
  if (PK) {
    formData.append('PK', PK);
  }
  if (storyId) {
    formData.append('storyId', storyId);
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
  const results = await client.patch(`${SERVICES_HOST}/storyNodes/actions/updatePicture`, formData);
  return results.data.user;
};

/* eslint-enable no-console */

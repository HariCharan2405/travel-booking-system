import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    }
  });
  

export const getUser = () => API.get('/auth/user');
export const logout = () => API.get('/auth/logout');

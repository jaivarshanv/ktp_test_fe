import axios from 'axios';
const API = axios.create({ baseURL: 'https://ktp-testing-1.onrender.com/api' });
export default API;
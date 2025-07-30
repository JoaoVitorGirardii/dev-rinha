import axios from 'axios';

const paymentsProcessorDefault = axios.create({
  baseURL: process.env.BASE_URL_DEFAULT || 'http://localhost:8001',//'http://payment-processor-default:8080',
  headers: {
    "Content-Type": 'application/json',
  },
  timeout: 500
});

export default paymentsProcessorDefault;

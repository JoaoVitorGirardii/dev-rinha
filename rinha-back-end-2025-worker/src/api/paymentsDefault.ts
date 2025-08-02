import axios from 'axios';

const paymentsProcessorDefault = axios.create({
  baseURL: process.env.BASE_URL_DEFAULT || 'http://payment-processor-default:8080',
  headers: {
    "Content-Type": 'application/json',
  },
});

export default paymentsProcessorDefault;

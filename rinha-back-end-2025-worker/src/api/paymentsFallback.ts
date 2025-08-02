import axios from 'axios';

const paymentsProcessorFallback = axios.create({
  baseURL: process.env.BASE_URL_FALLBACK || 'http://payment-processor-fallback:8080',
  headers: {
    "Content-Type": 'application/json',
  },
});

export default paymentsProcessorFallback;

import axios from 'axios';

const paymentsProcessorFallback = axios.create({
  baseURL: process.env.BASE_URL_FALLBACK || 'http://localhost:8002',//'http://payment-processor-fallback:8080',
  headers: {
    "Content-Type": 'application/json',
  },
  timeout: 500
});

export default paymentsProcessorFallback;

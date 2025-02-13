import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 },  // Stay at 50 users
    { duration: '20s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{status:429}': ['p(95)<100'], // Rate limit responses should be fast
    errors: ['rate<0.1'], // Error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/graphql';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token'; // Replace with actual token in CI

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
  };

  const query = JSON.stringify({
    query: `
      query {
        debates {
          id
          title
        }
      }
    `,
  });

  const response = http.post(BASE_URL, query, { headers });

  // Check if response is successful or expected rate limit
  const success = check(response, {
    'is success': (r) => r.status === 200 || r.status === 429,
    'rate limit headers present when limited': (r) => {
      if (r.status === 429) {
        return r.headers['Retry-After'] !== undefined &&
               r.headers['X-RateLimit-Limit'] !== undefined &&
               r.headers['X-RateLimit-Remaining'] !== undefined;
      }
      return true;
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  // Random sleep between requests to simulate real user behavior
  sleep(Math.random() * 2);
} 
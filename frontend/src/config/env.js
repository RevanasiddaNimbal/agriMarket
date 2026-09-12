export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  OAUTH2_GOOGLE_URL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`,
  OAUTH2_GITHUB_URL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/github`,
};

/**
 * API Configuration
 * Centralized configuration for all API calls
 */

const API_BASE_URL = 'https://newsapi.org/v2'
const API_KEY = import.meta.env.VITE_NEWS_API_KEY

export const newsApiConfig = {
    baseURL: API_BASE_URL,
    apiKey: API_KEY,
    endpoints: {
        topHeadlines: '/top-headlines',
        everything: '/everything'
    }
}

export default newsApiConfig

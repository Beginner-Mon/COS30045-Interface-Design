/**
 * News API Service
 * Handles all news-related API calls
 */

import axios from 'axios'
import { newsApiConfig } from './config'

const apiClient = axios.create({
    baseURL: newsApiConfig.baseURL
})

/**
 * Fetch top headlines for technology and AI news
 * @param {Object} options - Query options
 * @param {string} options.sortBy - Sort option (default: 'publishedAt')
 * @param {string} options.language - Language code (default: 'en')
 * @param {number} options.pageSize - Number of articles (default: 10)
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise} News data
 */
export const fetchTopHeadlines = async (options = {}) => {
    try {
        const {
            sortBy = 'publishedAt',
            language = 'en',
            pageSize = 10,
            page = 1,
            category = '',
            searchQuery = '',
            fromDate = '',
            toDate = ''
        } = options

        let q = 'artificial intelligence OR technology OR software OR hardware'
        
        if (searchQuery) {
            q = searchQuery
            if (category) {
                q += ` AND ${category}`
            }
        } else if (category) {
            q = category
        }

        const params = {
            q,
            language,
            sortBy,
            pageSize,
            page,
            apiKey: newsApiConfig.apiKey
        }

        if (fromDate) params.from = fromDate
        if (toDate) params.to = toDate

        const response = await apiClient.get(newsApiConfig.endpoints.everything, { params })

        return response.data
    } catch (error) {
        console.error('Error fetching news:', error)
        throw error
    }
}

export default {
    fetchTopHeadlines
}

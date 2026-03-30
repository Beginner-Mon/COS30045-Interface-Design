/**
 * Orchestrator API Service
 * Handles calls to unified backend pipeline on localhost:8080
 */

import axios from 'axios'
import { orchestratorApiConfig } from './config'

const orchestratorClient = axios.create({
    baseURL: orchestratorApiConfig.baseURL
})

/**
 * Request an orchestrated response from backend pipeline
 * @param {Object} payload
 * @param {string} payload.query - User query text
 * @param {string} [payload.user_id='default'] - User identifier
 * @param {Array<{role: 'user' | 'assistant', content: string}>} [payload.conversation_history] - Optional previous turns
 * @returns {Promise<Object>} { text_answer, exercises, motion, tts, generation_time_ms, errors }
 */
export const createSession = async (user_id) => {
    const response = await orchestratorClient.post(orchestratorApiConfig.endpoints.sessions, { user_id })
    return response.data
}

export const getSessions = async (user_id) => {
    const response = await orchestratorClient.get(`${orchestratorApiConfig.endpoints.sessions}/${user_id}`)
    return response.data
}

export const getSession = async (user_id, session_id) => {
    const response = await orchestratorClient.get(`${orchestratorApiConfig.endpoints.sessions}/${user_id}/${session_id}`)
    return response.data
}

export const deleteSession = async (user_id, session_id) => {
    const response = await orchestratorClient.delete(`${orchestratorApiConfig.endpoints.sessions}/${user_id}/${session_id}`)
    return response.data
}

export const fetchOrchestratorAnswer = async (payload) => {
    const requestBody = {
        query: payload?.query ?? '',
        user_id: payload?.user_id ?? 'default',
        ...(payload?.session_id && { session_id: payload.session_id })
    }

    if (Array.isArray(payload?.conversation_history) && payload.conversation_history.length > 0) {
        requestBody.conversation_history = payload.conversation_history
    }

    const response = await orchestratorClient.post(orchestratorApiConfig.endpoints.answer, requestBody)
    return response.data
}

export const getAnswerStatus = async (taskId) => {
    const response = await orchestratorClient.get(`${orchestratorApiConfig.endpoints.answerStatus}/${taskId}`)
    return response.data
}

export default {
    createSession,
    getSessions,
    getSession,
    deleteSession,
    fetchOrchestratorAnswer,
    getAnswerStatus
}

import { computed, onBeforeUnmount, ref } from 'vue'
import { fetchOrchestratorAnswer, getAnswerStatus, createSession, getSession } from '@/api'
import { useUserStore } from '@/stores/userStore'

export const useDashboardChat = () => {
  const userInput = ref('')
  const messages = ref([])
  const latestMotionUrl = ref('')
  const isThinking = ref(false)
  const isGeneratingMotion = ref(false)
  const currentSessionId = ref(null)
  const votes = ref({})  // { messageIndex: 'up' | 'down' | null }

  const userStore = useUserStore()
  const userId = computed(() => userStore.user?.uid || 'default')

  const hasAssistantResponse = computed(() =>
    messages.value.some((message) => message.role === 'assistant')
  )

  // ── Vote helpers ──────────────────────────────────────────────────
  const votesStorageKey = () => `chat-votes-${currentSessionId.value || 'unsaved'}`

  const saveVotes = () => {
    try {
      localStorage.setItem(votesStorageKey(), JSON.stringify(votes.value))
    } catch { /* quota exceeded – silently ignore */ }
  }

  const loadVotes = () => {
    try {
      const raw = localStorage.getItem(votesStorageKey())
      votes.value = raw ? JSON.parse(raw) : {}
    } catch {
      votes.value = {}
    }
  }

  const setVote = (index, vote) => {
    // Toggle: same vote again → clear it
    votes.value[index] = votes.value[index] === vote ? null : vote
    saveVotes()
  }

  const normalizeExercises = (exercises) => {
    if (!Array.isArray(exercises)) return []

    return exercises
      .map((exercise) => {
        if (typeof exercise === 'string') return exercise.trim()
        if (exercise && typeof exercise === 'object') {
          return String(exercise.name || exercise.title || '').trim()
        }
        return ''
      })
      .filter(Boolean)
  }

  const pollTask = async (taskId, assistantMessageIndex) => {
    let polling = true
    let delay = 1500
    let timeout = 600000 // 10 minutes
    const startTime = Date.now()

    while (polling && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, delay))
      try {
        const statusData = await getAnswerStatus(taskId)
        
        const result = statusData.result || {}
        const textAnswer = statusData.text_answer || result.text_answer || ''
        
        const motionFileUrl = statusData.motion?.motion_file_url || statusData.motion_file_url || result.motion_file_url || result.motion?.motion_file_url || result.motion_job?.motion_file_url || ''
        const audioUrl = statusData.tts?.audio_url || result.tts?.audio_url || result.metadata?.tts?.audio_url || ''
        
        console.log('[DEBUG useDashboardChat] pollTask tick. data:', statusData)
        console.log('[DEBUG useDashboardChat] pollTask extracted motionUrl:', motionFileUrl)
        
        if (textAnswer && !messages.value[assistantMessageIndex].text) {
          messages.value[assistantMessageIndex].text = textAnswer
          messages.value[assistantMessageIndex].exercises = normalizeExercises(result.exercises || statusData.exercises)
        }
        
        if (audioUrl && !messages.value[assistantMessageIndex].audioUrl) {
          messages.value[assistantMessageIndex].audioUrl = audioUrl
        }
        
        if (motionFileUrl) {
          latestMotionUrl.value = motionFileUrl
        }

        const isTerminal = statusData.status === 'completed' || statusData.status === 'failed' || statusData.progress_stage === 'completed' || statusData.progress_stage === 'failed'

        if (isTerminal) {
          polling = false
          isThinking.value = false
          isGeneratingMotion.value = false
          if (statusData.status === 'failed') {
            const errorMsg = statusData.error || statusData.motion_error || 'Task failed.'
            if (!messages.value[assistantMessageIndex].text) {
              messages.value[assistantMessageIndex].text = `Error: ${errorMsg}`
            }
          }
        } else if (textAnswer) {
          isThinking.value = false
          isGeneratingMotion.value = statusData.progress_stage === 'motion_generation'
        }
      } catch (e) {
        console.warn('Polling error:', e)
      }
    }

    isThinking.value = false
    isGeneratingMotion.value = false
  }

  const sendMessage = async () => {
    const text = userInput.value.trim()
    if (!text || isThinking.value) return

    messages.value.push({
      role: 'user',
      text
    })

    userInput.value = ''
    isThinking.value = true
    isGeneratingMotion.value = false

    messages.value.push({
      role: 'assistant',
      text: '',
      audioUrl: '',
      exercises: [],
      animated: true
    })
    const assistantIndex = messages.value.length - 1

    try {
      if (!currentSessionId.value) {
        const sess = await createSession(userId.value)
        currentSessionId.value = sess.session_id || sess.id
      }

      const conversation_history = messages.value.slice(0, -2).map((message) => ({
        role: message.role,
        content: message.text
      }))

      const data = await fetchOrchestratorAnswer({
        query: text,
        user_id: userId.value,
        session_id: currentSessionId.value,
        conversation_history
      })

      const taskId = data?.request_id || data?.task_id

      const result = data.result || {}
      const textAnswer = data.text_answer || result.text_answer || ''
      const isTerminal = data.status === 'completed' || data.status === 'failed'

      console.log('[DEBUG useDashboardChat] fetchOrchestratorAnswer initial data:', data)

      if (textAnswer) {
        messages.value[assistantIndex].text = textAnswer
        messages.value[assistantIndex].exercises = normalizeExercises(result.exercises || data.exercises)
        
        const audioUrl = data.tts?.audio_url || result.tts?.audio_url || result.metadata?.tts?.audio_url || ''
        if (audioUrl) {
          messages.value[assistantIndex].audioUrl = audioUrl
        }
        
        const motionFileUrl = data.motion?.motion_file_url || data.motion_file_url || result.motion_file_url || result.motion?.motion_file_url || result.motion_job?.motion_file_url || ''
        console.log('[DEBUG useDashboardChat] fetchOrchestratorAnswer motionFileUrl:', motionFileUrl)
        
        if (motionFileUrl) {
          latestMotionUrl.value = motionFileUrl
        }
        
        isThinking.value = false
        if (!isTerminal && data.progress_stage === 'motion_generation') {
          isGeneratingMotion.value = true
        }
      }

      if (taskId && !isTerminal) {
        pollTask(taskId, assistantIndex)
      } else {
        isThinking.value = false
        if (data.status === 'failed' && !messages.value[assistantIndex].text) {
          messages.value[assistantIndex].text = `Error: ${data.error || 'Failed to complete.'}`
        }
      }
    } catch (error) {
      isThinking.value = false
      isGeneratingMotion.value = false
      const message = error?.response?.data?.detail || error?.message || 'Failed to contact orchestrator API.'
      if (!messages.value[assistantIndex].text) {
          messages.value[assistantIndex].text = `Error: ${message}`
      }
    }
  }

  const loadSession = async (sessionId) => {
    clearMessages()
    try {
      const data = await getSession(userId.value, sessionId)
      if (data && data.messages) {
        messages.value = data.messages.map(m => ({
          role: m.role,
          text: m.content || m.text || '',
          audioUrl: m.audioUrl || '',
          exercises: normalizeExercises(m.exercises),
          animated: false
        }))
      }
      currentSessionId.value = sessionId
      loadVotes()
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const clearMessages = () => {
    messages.value = []
    userInput.value = ''
    isThinking.value = false
    isGeneratingMotion.value = false
    latestMotionUrl.value = ''
    currentSessionId.value = null
    votes.value = {}
  }

  onBeforeUnmount(() => {
    // Component unmount cleanup if needed
  })

  return {
    userInput,
    messages,
    latestMotionUrl,
    isThinking,
    isGeneratingMotion,
    hasAssistantResponse,
    currentSessionId,
    votes,
    setVote,
    sendMessage,
    loadSession,
    clearMessages
  }
}

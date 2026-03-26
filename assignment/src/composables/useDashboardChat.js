import { computed, onBeforeUnmount, ref } from 'vue'
import { fetchOrchestratorAnswer } from '@/api'

export const useDashboardChat = () => {
  const userInput = ref('')
  const messages = ref([])
  const latestMotionUrl = ref('')
  const isThinking = ref(false)

  const hasAssistantResponse = computed(() =>
    messages.value.some((message) => message.role === 'assistant')
  )

  let audioPlayer = null

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

  const playMessageAudio = async (url) => {
    if (!url) return

    if (!audioPlayer) {
      audioPlayer = new Audio()
    }

    if (audioPlayer.src !== url) {
      audioPlayer.src = url
    } else {
      audioPlayer.currentTime = 0
    }

    try {
      await audioPlayer.play()
    } catch (error) {
      console.warn('Failed to play TTS audio:', error)
    }
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

    try {
      const conversation_history = messages.value.slice(0, -1).map((message) => ({
        role: message.role,
        content: message.text
      }))

      const data = await fetchOrchestratorAnswer({
        query: text,
        user_id: 'default',
        conversation_history
      })

      const audioUrl = data?.tts?.audio_url || ''
      latestMotionUrl.value = data?.motion?.motion_file_url || ''

      messages.value.push({
        role: 'assistant',
        text: data?.text_answer || 'No response text received from orchestrator.',
        audioUrl,
        exercises: normalizeExercises(data?.exercises)
      })

      if (audioUrl) {
        await playMessageAudio(audioUrl)
      }
    } catch (error) {
      const message = error?.response?.data?.detail || error?.message || 'Failed to contact orchestrator API.'
      messages.value.push({
        role: 'assistant',
        text: `Error: ${message}`
      })
    } finally {
      isThinking.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
    userInput.value = ''
    isThinking.value = false
    latestMotionUrl.value = ''

    if (audioPlayer) {
      audioPlayer.pause()
      audioPlayer.currentTime = 0
    }
  }

  onBeforeUnmount(() => {
    if (audioPlayer) {
      audioPlayer.pause()
      audioPlayer.src = ''
    }
  })

  return {
    userInput,
    messages,
    latestMotionUrl,
    isThinking,
    hasAssistantResponse,
    sendMessage,
    clearMessages,
    playMessageAudio
  }
}

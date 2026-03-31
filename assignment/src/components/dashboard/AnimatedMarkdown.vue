<template>
  <div class="animated-markdown" v-html="sanitizedHtml"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  isAssistant: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  }
})

const displayedText = ref('')
const animatorActive = ref(true)
let timer = null
let words = []
let currentIndex = 0

// Force synchronous marked parsing
const parseMarkdown = (rawText) => {
  try {
    const html = marked.parse(rawText || '', { async: false })
    return typeof html === 'string' ? html : ''
  } catch (e) {
    console.error('Markdown parsing error:', e)
    return rawText
  }
}

const sanitizedHtml = computed(() => {
  const rawText = (props.isAssistant && props.animated && animatorActive.value) ? displayedText.value : props.text
  return DOMPurify.sanitize(parseMarkdown(rawText))
})

const startAnimation = () => {
  stopAnimation()
  if (!props.isAssistant || !props.animated) {
    displayedText.value = props.text
    animatorActive.value = false
    return
  }
  
  words = props.text.match(/\S+|\s/g) || []
  currentIndex = 0
  displayedText.value = ''
  animatorActive.value = true
  
  if (words.length === 0) return

  timer = setInterval(() => {
    if (currentIndex < words.length) {
      displayedText.value += words[currentIndex]
      currentIndex++
    } else {
      stopAnimation()
    }
  }, 35) // Speed
}

const stopAnimation = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(() => props.text, (newVal, oldVal) => {
  if (props.isAssistant && props.animated && animatorActive.value) {
    if (newVal.startsWith(oldVal) && timer) {
      words = newVal.match(/\S+|\s/g) || []
    } else {
      startAnimation()
    }
  }
})

onMounted(() => {
  startAnimation()
})

onBeforeUnmount(() => {
  stopAnimation()
})
</script>

<style scoped>
.animated-markdown {
  white-space: normal;
  word-wrap: break-word;
}

.animated-markdown :deep(p) {
  margin-bottom: 0.5rem;
}

.animated-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.animated-markdown :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.9em;
  color: #d63384;
}

.animated-markdown :deep(pre) {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.4rem;
  overflow-x: auto;
  border: 1px solid #dee2e6;
}

.animated-markdown :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.animated-markdown :deep(ul),
.animated-markdown :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}
</style>

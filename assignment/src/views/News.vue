<template>
  <div class="news-container">
    <section class="px-md-5 py-5">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="alert alert-danger" role="alert">
        Error loading news: {{ error }}
      </div>

      <!-- Featured News (First Article) -->
      <template v-if="articles.length > 0 && !loading">
        <div class="featured-article mb-5">
          <div class="row align-items-center" style="min-height: 16rem">
            <!-- Image on Left -->
            <div class="col-md-5">
              <img
                v-if="articles[0].urlToImage"
                :src="articles[0].urlToImage"
                :alt="articles[0].title"
                class="img-fluid rounded"
              />
              <div v-else class="bg-secondary rounded" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                <span class="text-white">No Image</span>
              </div>
            </div>

            <!-- Content on Right -->
            <div class="col-md-7 ps-md-4">
              <h2 class="news-title mb-3">{{ articles[0].title }}</h2>
              <p class="news-description mb-3">{{ articles[0].description }}</p>
              <p class="text-muted small mb-2">
                <strong>Source:</strong> {{ articles[0].source.name }}
              </p>
              <p class="text-muted small">
                <strong>Published:</strong> {{ formatDate(articles[0].publishedAt) }}
              </p>
              <a
                :href="articles[0].url"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary btn-sm"
              >
                Read Full Article
              </a>
            </div>
          </div>
        </div>

        <!-- Other Articles -->
        <div class="other-articles">
          <h3 class="mb-4">More News</h3>
          <div class="row">
            <div v-for="(article, index) in articles.slice(1)" :key="index" class="col-md-6 mb-4">
              <div class="article-card h-100">
                <div class="row g-3 align-items-center">
                  <!-- Image on Left (Small) -->
                  <div class="col-md-5">
                    <img
                      v-if="article.urlToImage"
                      :src="article.urlToImage"
                      :alt="article.title"
                      class="img-fluid rounded"
                      style="height: 120px; object-fit: cover; width: 100%"
                    />
                    <div v-else class="bg-secondary rounded" style="height: 120px; display: flex; align-items: center; justify-content: center;">
                      <span class="text-white small">No Image</span>
                    </div>
                  </div>

                  <!-- Content on Right (Small) -->
                  <div class="col-md-7">
                    <h5 class="article-title mb-2">{{ article.title }}</h5>
                    <p class="article-description small mb-2">
                      {{ truncateText(article.description, 80) }}
                    </p>
                    <p class="text-muted small mb-2">
                      {{ formatDate(article.publishedAt) }}
                    </p>
                    <a
                      :href="article.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-outline-primary btn-sm"
                    >
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- No Articles Found -->
      <div v-if="articles.length === 0 && !loading && !error" class="alert alert-info">
        No news articles found. Please try again later.
      </div>

      <!-- Pagination -->
      <nav v-if="articles.length > 0" class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
        <div class="text-muted small">
          <span v-if="totalResults > 0">
            Showing {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalResults) }} of {{ totalResults }} articles
          </span>
        </div>

        <ul class="pagination mb-0">
          <!-- Previous Button -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button
              @click="fetchNews(currentPage - 1)"
              class="page-link"
              :disabled="currentPage === 1"
            >
              Previous
            </button>
          </li>

          <!-- Page Numbers -->
          <li
            v-for="page in Math.min(5, totalPages)"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button
              @click="fetchNews(page)"
              class="page-link"
            >
              {{ page }}
            </button>
          </li>

          <!-- More Pages Indicator -->
          <li v-if="totalPages > 5" class="page-item disabled">
            <span class="page-link">...</span>
          </li>

          <!-- Next Button -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button
              @click="fetchNews(currentPage + 1)"
              class="page-link"
              :disabled="currentPage === totalPages"
            >
              Next
            </button>
          </li>
        </ul>

        <div class="text-muted small">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
      </nav>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { fetchTopHeadlines } from '@/api'

export default {
  name: 'News',
  setup() {
    const articles = ref([])
    const loading = ref(true)
    const error = ref(null)
    const currentPage = ref(1)
    const totalResults = ref(0)
    const pageSize = 10

    const totalPages = computed(() => {
      return Math.ceil(totalResults.value / pageSize)
    })

    const fetchNews = async (page = 1) => {
      try {
        loading.value = true
        error.value = null
        currentPage.value = page

        // Fetch news with specific parameters
        // Sorted by publishedAt (latest first)
        const data = await fetchTopHeadlines({
          q: 'artificial intelligence',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize,
          page
        })

        articles.value = data.articles || []
        totalResults.value = data.totalResults || 0
      } catch (err) {
        error.value = err.message || 'Failed to load news articles'
        console.error('Error fetching news:', err)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    }

    const truncateText = (text, length) => {
      if (!text) return ''
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    }

    onMounted(() => {
      fetchNews()
    })

    return {
      articles,
      loading,
      error,
      currentPage,
      totalPages,
      totalResults,
      pageSize,
      fetchNews,
      formatDate,
      truncateText
    }
  }
}
</script>

<style scoped>
.news-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.featured-article {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.news-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #212529;
  line-height: 1.3;
}

.news-description {
  font-size: 1rem;
  color: #495057;
  line-height: 1.6;
}

.article-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.article-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.article-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
}

.article-description {
  color: #6c757d;
  line-height: 1.5;
}

.other-articles {
  margin-top: 3rem;
}

.other-articles h3 {
  font-weight: 600;
  color: #212529;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

img {
  max-width: 100%;
  height: auto;
}

.pagination {
  gap: 0.5rem;
}

.page-item button {
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-item:not(.disabled) button:hover {
  background-color: #007bff;
  color: white;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

.page-item.disabled button {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .featured-article {
    padding: 1rem;
  }

  .news-title {
    font-size: 1.5rem;
  }

  .article-card {
    padding: 1rem;
  }

  .row {
    flex-direction: column;
  }

  nav {
    flex-direction: column;
    gap: 1.5rem;
  }

  .pagination {
    width: 100%;
    justify-content: center;
  }
}
</style>

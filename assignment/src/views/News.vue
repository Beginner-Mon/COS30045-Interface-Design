<template>
  <div class="bg-light min-vh-100">
    <section class="px-3 px-md-5 py-5">
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

      <!-- Filters and Search -->
      <div class="row mt-5 mb-5 g-3 align-items-end p-3 p-md-4 rounded bg-white shadow-sm mx-0">
        <div class="col-12 col-md-4">
          <label class="form-label text-muted small fw-bold text-uppercase">Search Keywords</label>
          <input type="text" v-model="filters.searchQuery" class="form-control" placeholder="Search title or content..." @keyup.enter="applyFilters" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label text-muted small fw-bold text-uppercase">Category</label>
          <select v-model="filters.category" class="form-control form-select" @change="applyFilters">
            <option value="">All Tech &amp; AI</option>
            <option value="artificial intelligence">Artificial Intelligence</option>
            <option value="software">Software</option>
            <option value="hardware">Hardware</option>
            <option value="cybersecurity">Cybersecurity</option>
          </select>
        </div>
        <div class="col-6 col-md-2">
          <label class="form-label text-muted small fw-bold text-uppercase">From Date</label>
          <input type="date" v-model="filters.fromDate" class="form-control" @change="applyFilters" />
        </div>
        <div class="col-6 col-md-2">
          <label class="form-label text-muted small fw-bold text-uppercase">To Date</label>
          <input type="date" v-model="filters.toDate" class="form-control" @change="applyFilters" />
        </div>
        <div class="col-6 col-md-1 d-flex">
          <button class="btn btn-dark w-100" @click="applyFilters" :disabled="loading">Go</button>
        </div>
      </div>

      <!-- Featured News (First Article) -->
      <template v-if="articles.length > 0 && !loading">
        <div class="bg-white rounded-3 shadow-sm mb-5 p-3 p-md-4">
          <div class="row align-items-stretch">
            <!-- Image on Left -->
            <div class="col-12 col-md-5 mb-3 mb-md-0">
              <img
                v-if="articles[0].urlToImage"
                :src="articles[0].urlToImage"
                :alt="articles[0].title"
                class="featured-img rounded w-100"
                style="object-fit: cover"
              />
              <div v-else class="bg-secondary rounded d-flex align-items-center justify-content-center" style="height: 200px">
                <span class="text-white">No Image</span>
              </div>
            </div>

            <!-- Content on Right -->
            <div class="col-12 col-md-7 ps-md-4">
              <h2 class="fs-3 fw-semibold text-dark lh-sm mb-3">{{ articles[0].title }}</h2>
              <p class="text-secondary lh-lg mb-3">{{ articles[0].description }}</p>
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
                class="btn btn-dark btn-sm"
              >
                Read Full Article
              </a>
            </div>
          </div>
        </div>

        <!-- Other Articles -->
        <div class="mt-5">
          <h3 class="fw-semibold text-dark border-bottom border-dark border-2 pb-2 mb-4">More News</h3>
          <div class="row">
            <div v-for="(article, index) in articles.slice(1)" :key="index" class="col-12 col-md-6 mb-4">
              <div class="article-card bg-white rounded-3 border h-100 p-2 p-md-3">
                <div class="row g-3 align-items-stretch">
                  <!-- Image on Left (Small) -->
                  <div class="col-4 col-md-5">
                    <img
                      v-if="article.urlToImage"
                      :src="article.urlToImage"
                      :alt="article.title"
                      class="article-img rounded w-100"
                      style="object-fit: cover"
                    />
                    <div v-else class="bg-secondary rounded d-flex align-items-center justify-content-center h-100" style="min-height: 100px">
                      <span class="text-white small">No Image</span>
                    </div>
                  </div>

                  <!-- Content on Right (Small) -->
                  <div class="col-8 col-md-7">
                    <h5 class="fs-6 fw-semibold text-dark lh-sm mb-2">{{ article.title }}</h5>
                    <p class="text-secondary small mb-2">
                      {{ truncateText(article.description, 80) }}
                    </p>
                    <p class="text-muted small mb-2">
                      {{ formatDate(article.publishedAt) }}
                    </p>
                    <a
                      :href="article.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-dark btn-sm"
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
      <nav v-if="articles.length > 0" class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 pt-4 border-top gap-3">
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
            v-for="page in visiblePages"
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

    const filters = ref({
      searchQuery: '',
      category: '',
      fromDate: '',
      toDate: ''
    })

    const applyFilters = () => {
      fetchNews(1)
    }

    const totalPages = computed(() => {
      return Math.ceil(totalResults.value / pageSize)
    })

    const visiblePages = computed(() => {
      const pages = []
      const startPage = Math.max(1, currentPage.value - 1)
      const endPage = Math.min(totalPages.value, currentPage.value + 1)
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    })

    const fetchNews = async (page = 1) => {
      try {
        loading.value = true
        error.value = null
        currentPage.value = page

        const data = await fetchTopHeadlines({
          language: 'en',
          sortBy: 'publishedAt',
          pageSize,
          page,
          searchQuery: filters.value.searchQuery,
          category: filters.value.category,
          fromDate: filters.value.fromDate,
          toDate: filters.value.toDate
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
      visiblePages,
      totalResults,
      pageSize,
      filters,
      applyFilters,
      fetchNews,
      formatDate,
      truncateText
    }
  }
}

</script>

<style scoped>
.featured-img {
  height: 200px;
}

.article-img {
  height: 100%;
  min-height: 100px;
}

@media (min-width: 768px) {
  .featured-img {
    height: 100%;
    min-height: 16rem;
  }
}

.article-card {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.article-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.page-item.active .page-link {
  background-color: #000;
  border-color: #000;
}

.page-item:not(.disabled) button:hover {
  background-color: #000;
  color: white;
}
</style>

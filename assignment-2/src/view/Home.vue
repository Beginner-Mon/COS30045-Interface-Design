<script setup>
import JobOverview from '@/components/JobOverview.vue'
import TitlePage from '@/components/TitlePage.vue'
import bgImage from '@/assets/temp.jpg'
import JobTemplate from '@/components/JobTemplate.vue'
import JobList from '@/components/JobList.vue'
</script>

<template>
  <TitlePage title="Welcome to Job finding website" :image="bgImage" />
  <JobTemplate />
  <JobList />
</template>

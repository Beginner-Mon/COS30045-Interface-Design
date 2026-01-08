<script setup>
import TitlePage from '@/components/TitlePage.vue'
import tempImage from '@/assets/temp.jpg'
import EventsTable from '@/components/EventsTable.vue'
</script>

<template>
  <TitlePage title="Events" :image="tempImage" />

  <EventsTable />
</template>

<template>
  <section id="features" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
        <p class="text-xl text-gray-600">Everything you need to analyze Google Ads data effectively</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="feature in features" 
          :key="feature.title"
          class="bg-gray-50 p-8 rounded-xl hover-scale cursor-pointer"
        >
          <div class="text-primary text-4xl mb-4">
            <i :class="feature.icon"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Features',
  setup() {
    const features = ref([
      {
        icon: 'fas fa-database',
        title: 'Data Scraping',
        description: 'Automatically scrape ad data from Google Ads Transparency Center with one click.'
      },
      {
        icon: 'fas fa-chart-bar',
        title: 'Ad Analytics',
        description: 'View detailed analytics including spend, impressions, duration, and target websites.'
      },
      {
        icon: 'fas fa-balance-scale',
        title: 'Campaign Comparison',
        description: 'Compare multiple ad campaigns side-by-side to identify winning strategies.'
      },
      {
        icon: 'fas fa-clock',
        title: 'Real-time Updates',
        description: 'Get instant access to the latest ad data as soon as it\'s published.'
      },
      {
        icon: 'fas fa-download',
        title: 'Export Data',
        description: 'Export your analysis to CSV, Excel, or PDF for reporting and presentations.'
      },
      {
        icon: 'fas fa-shield-alt',
        title: 'Secure & Private',
        description: 'Your data is encrypted and secure. We never share your information.'
      }
    ]);

    return { features };
  }
}
</script>
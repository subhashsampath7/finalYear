<template>
  <section class="gradient-bg text-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="animate-fade-in">
          <h1 class="text-5xl font-bold mb-6 leading-tight">
            Unlock Google Ads Insights with Transparency
          </h1>
          <p class="text-xl mb-8 text-gray-100">
            Scrape, analyze, and compare Google Ads data from the Transparency Center. 
            Make informed decisions with comprehensive ad intelligence.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <router-link 
              to="/register" 
              class="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
            >
              Get Started Free
            </router-link>
            <a 
              href="#features" 
              class="border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition text-center"
            >
              Learn More
            </a>
          </div>
          
          <div class="mt-12 flex items-center space-x-8">
            <div>
              <div class="text-3xl font-bold">10K+</div>
              <div class="text-gray-200">Active Users</div>
            </div>
            <div>
              <div class="text-3xl font-bold">50M+</div>
              <div class="text-gray-200">Ads Analyzed</div>
            </div>
            <div>
              <div class="text-3xl font-bold">99.9%</div>
              <div class="text-gray-200">Uptime</div>
            </div>
          </div>
        </div>
        
        <div class="animate-fade-in">
          <div class="glass-effect rounded-2xl p-8 shadow-2xl">
            <img 
              src="@/assets/product.jpg" 
              alt="Extension Dashboard" 
              class="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Hero'
}
</script>
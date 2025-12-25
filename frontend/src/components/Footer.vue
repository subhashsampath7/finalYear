<template>
  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-chart-line text-primary text-2xl"></i>
            <span class="text-xl font-bold">Google Ads Transparency</span>
          </div>
          <p class="text-gray-400">
            Make better advertising decisions with powerful data analysis tools.
          </p>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4">Product</h3>
          <ul class="space-y-2">
            <li><a href="#features" class="text-gray-400 hover:text-white transition">Features</a></li>
            <li><a href="#pricing" class="text-gray-400 hover:text-white transition">Pricing</a></li>
            <li><router-link to="/register" class="text-gray-400 hover:text-white transition">Get Started</router-link></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4">Support</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white transition">Documentation</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">Help Center</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">Contact Us</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4">Connect</h3>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white transition text-2xl">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition text-2xl">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition text-2xl">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition text-2xl">
              <i class="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 Google Ads Transparency Extension. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>
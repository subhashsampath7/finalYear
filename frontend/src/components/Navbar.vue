<template>
  <nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <!-- ✅ Changed router-link to @click -->
          <a @click.prevent="goToHome" href="/" class="flex items-center space-x-2 cursor-pointer">
            <i class="fas fa-chart-line text-primary text-2xl"></i>
            <span class="text-xl font-bold text-gray-800">Google Ads Transparency</span>
          </a>
        </div>
        
        <div class="hidden md:flex items-center space-x-8">
          <!-- ✅ Changed Home link -->
          <a @click.prevent="goToHome" href="/" class="text-gray-700 hover:text-primary transition cursor-pointer">
            Home
          </a>
          
          <a @click.prevent="scrollToSection('features')" href="#features" class="text-gray-700 hover:text-primary transition cursor-pointer">
            Features
          </a>
          <a @click.prevent="scrollToSection('pricing')" href="#pricing" class="text-gray-700 hover:text-primary transition cursor-pointer">
            Pricing
          </a>
          
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="text-gray-700 hover:text-primary transition">Login</router-link>
            <router-link to="/register" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
              Get Started
            </router-link>
          </template>
          
          <template v-else>
            <router-link to="/dashboard" class="text-gray-700 hover:text-primary transition">Dashboard</router-link>
            <button @click="handleLogout" class="text-gray-700 hover:text-primary transition">
              <i class="fas fa-sign-out-alt mr-2"></i>Logout
            </button>
          </template>
        </div>
        
        <div class="md:hidden flex items-center">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-700">
            <i class="fas text-2xl" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <!-- ✅ Changed mobile Home link -->
        <a @click.prevent="goToHome" href="/" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
          Home
        </a>
        
        <a @click.prevent="scrollToSection('features')" href="#features" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
          Features
        </a>
        <a @click.prevent="scrollToSection('pricing')" href="#pricing" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
          Pricing
        </a>
        
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Login</router-link>
          <router-link to="/register" class="block px-3 py-2 bg-primary text-white rounded">Get Started</router-link>
        </template>
        
        <template v-else>
          <router-link to="/dashboard" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Dashboard</router-link>
          <button @click="handleLogout" class="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Logout</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { store } from '../store';
import { signOutUser } from '../config/firebase';

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const mobileMenuOpen = ref(false);
    const isAuthenticated = computed(() => store.isAuthenticated);

    const handleLogout = async () => {
      await signOutUser();
      store.logout();
      router.push('/');
    };

    // ✅ New function to go to home and scroll to top
    const goToHome = () => {
      // Close mobile menu if open
      mobileMenuOpen.value = false;

      // If not on home page, navigate to home
      if (route.path !== '/') {
        router.push('/').then(() => {
          // Scroll to top after navigation
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        // Already on home page, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Function to handle section scrolling
    const scrollToSection = (sectionId) => {
      // Close mobile menu if open
      mobileMenuOpen.value = false;

      // If not on home page, navigate to home first
      if (route.path !== '/') {
        router.push('/').then(() => {
          // Wait for navigation to complete, then scroll
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        });
      } else {
        // Already on home page, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    return {
      mobileMenuOpen,
      isAuthenticated,
      handleLogout,
      goToHome,
      scrollToSection
    };
  }
}
</script>

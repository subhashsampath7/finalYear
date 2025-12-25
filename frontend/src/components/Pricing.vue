<template>
  <section id="pricing" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
        <p class="text-xl text-gray-600">Choose the plan that works best for you</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-gray-600">Loading pricing plans...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <p class="text-red-600">{{ error }}</p>
        <button @click="fetchPlans" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
          Try Again
        </button>
      </div>

      <!-- Pricing Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="plan in sortedPlans" 
          :key="plan.id"
          :class="[
            'rounded-xl shadow-lg p-8 hover-scale transition-all duration-300',
            plan.duration_months === 3 
              ? 'bg-primary text-white transform scale-105 relative' 
              : 'bg-white'
          ]"
        >
          <!-- Popular Badge -->
          <div 
            v-if="plan.duration_months === 3" 
            class="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg font-semibold text-sm"
          >
            POPULAR
          </div>

          <div class="text-center mb-8">
            <h3 
              :class="[
                'text-2xl font-bold mb-2',
                plan.duration_months === 3 ? 'text-white' : 'text-gray-900'
              ]"
            >
              {{ getPlanName(plan.duration_months) }}
            </h3>
            <div 
              :class="[
                'text-5xl font-bold mb-2',
                plan.duration_months === 3 ? 'text-white' : 'text-primary'
              ]"
            >
              ${{ plan.price }}
            </div>
            <p 
              :class="[
                plan.duration_months === 3 ? 'text-gray-100' : 'text-gray-600'
              ]"
            >
              {{ plan.description }}
            </p>
            <p 
              v-if="getSavingsPercent(plan.duration_months) > 0"
              :class="[
                'text-sm font-semibold mt-2',
                plan.duration_months === 3 ? 'text-yellow-300' : 'text-green-600'
              ]"
            >
              Save {{ getSavingsPercent(plan.duration_months) }}%
            </p>
          </div>

          <ul class="space-y-4 mb-8">
            <li 
              v-for="(feature, idx) in getFeatures(plan.features)" 
              :key="idx"
              class="flex items-start"
            >
              <i 
                :class="[
                  'fas fa-check mr-3 mt-1',
                  plan.duration_months === 3 ? 'text-yellow-400' : 'text-green-500'
                ]"
              ></i>
              <span :class="plan.duration_months === 3 ? 'text-white' : 'text-gray-700'">
                {{ feature }}
              </span>
            </li>
          </ul>

          <router-link 
            to="/register" 
            :class="[
              'block w-full text-center py-3 rounded-lg font-semibold transition',
              plan.duration_months === 3 
                ? 'bg-white text-primary hover:bg-gray-100' 
                : 'bg-primary text-white hover:bg-blue-600'
            ]"
          >
            Get Started
          </router-link>
        </div>
      </div>

      <!-- No Plans Available -->
      <div v-if="!loading && !error && sortedPlans.length === 0" class="text-center py-12">
        <i class="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
        <p class="text-gray-600">No pricing plans available at the moment.</p>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { pricingAPI } from '../services/api';

export default {
  name: 'Pricing',
  setup() {
    const plans = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchPlans = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await pricingAPI.getAllPlans();
        plans.value = response.plans || [];
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
        error.value = 'Failed to load pricing plans. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    const sortedPlans = computed(() => {
      return [...plans.value].sort((a, b) => a.duration_months - b.duration_months);
    });

    const getPlanName = (months) => {
      if (months === 1) return 'Monthly';
      if (months === 3) return 'Quarterly';
      if (months === 12) return 'Annual';
      return `${months} Months`;
    };

    const getFeatures = (features) => {
      if (!features) return [];
      try {
        return typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        return [];
      }
    };

    const getSavingsPercent = (months) => {
      const monthlyPlan = plans.value.find(p => p.duration_months === 1);
      const currentPlan = plans.value.find(p => p.duration_months === months);
      
      if (!monthlyPlan || !currentPlan || months === 1) return 0;
      
      const monthlyTotal = monthlyPlan.price * months;
      const savings = ((monthlyTotal - currentPlan.price) / monthlyTotal) * 100;
      
      return Math.round(savings);
    };

    onMounted(() => {
      fetchPlans();
    });

    return {
      plans,
      sortedPlans,
      loading,
      error,
      fetchPlans,
      getPlanName,
      getFeatures,
      getSavingsPercent
    };
  }
}
</script>

<style scoped>
.hover-scale {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-scale:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4285f4;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<template>
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
        <p class="text-xl text-gray-600">Trusted by thousands of advertisers worldwide</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="testimonial in testimonials" 
          :key="testimonial.name"
          class="bg-gray-50 p-8 rounded-xl"
        >
          <div class="flex items-center mb-4">
            <div class="text-yellow-400 text-xl">
              <i v-for="n in 5" :key="n" class="fas fa-star"></i>
            </div>
          </div>
          <p class="text-gray-700 mb-6 italic">"{{ testimonial.text }}"</p>
          <div class="flex items-center">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              {{ testimonial.name.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ testimonial.name }}</div>
              <div class="text-gray-600 text-sm">{{ testimonial.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Testimonials',
  setup() {
    const testimonials = ref([
      {
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        text: 'This extension has transformed how we analyze competitor ads. The insights are invaluable!'
      },
      {
        name: 'Michael Chen',
        role: 'Digital Marketing Manager',
        text: 'Easy to use and incredibly powerful. We\'ve optimized our ad spend by 40% using this tool.'
      },
      {
        name: 'Emily Rodriguez',
        role: 'Business Analyst',
        text: 'The data comparison features are exactly what we needed. Highly recommended!'
      }
    ]);

    return { testimonials };
  }
}
</script>
<template>
  <div>
    <Navbar />
    <Hero />
    <Features />
    <Pricing />
    <Testimonials />
    <Footer />
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Hero from '../components/Hero.vue';
import Features from '../components/Features.vue';
import Pricing from '../components/Pricing.vue';
import Testimonials from '../components/Testimonials.vue';
import Footer from '../components/Footer.vue';

export default {
  name: 'Home',
  components: {
    Navbar,
    Hero,
    Features,
    Pricing,
    Testimonials,
    Footer
  }
}
</script>
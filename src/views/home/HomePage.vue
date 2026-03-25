<template>
        <main class="main" id="top">
            <Navbar />
            <Hero />
            <Services />
            <Form />
            <Footer />
 </main>

</template>
<script setup>
import Hero from './Hero.vue';
import Services from './Services.vue';
import  Navbar from './layouts/Navbar.vue';
import Footer from './layouts/Footer.vue';
import Form from './Form.vue';

</script>
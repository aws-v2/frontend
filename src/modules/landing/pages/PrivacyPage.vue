<script setup lang="ts">
import PublicNavbar from '@/shared/components/PublicNavbar.vue'
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">
        <PublicNavbar />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <main class="max-w-4xl mx-auto px-6 py-20">
            <div class="w-12 h-2 bg-[#ff9900] mb-8"></div>
            <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter mb-12">Privacy Policy</h1>

            <div class="prose prose-slate max-w-none space-y-12">
                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        1. Data Collection</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        Serwin Systems collects information that you provide directly to us when you create an account,
                        use our cloud services, or communicate with us. This includes technical data such as IP
                        addresses, browser types, and usage patterns within the Serwin Console.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        2. Use of Information</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        We use the information we collect to provide, maintain, and improve our services, to develop new
                        ones, and to protect Serwin Systems and our users. This includes processing identity
                        verification for high-performance resource provisioning.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        3. Data Security</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        We work hard to protect Serwin Systems and our users from unauthorized access to or unauthorized
                        alteration, disclosure, or destruction of information we hold. We use industry-standard
                        encryption (AES-256) for all sensitive data stored in our systems.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        4. Compliance</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        We regularly review our compliance with our Privacy Policy. We also adhere to several
                        self-regulatory frameworks. When we receive formal written complaints, we will contact the
                        person who made the complaint to follow up.
                    </p>
                </section>
            </div>
        </main>

        <footer class="py-12 border-t border-[#eaeded] text-center bg-[#fafafa]">
            <p class="text-[10px] text-[#879196] font-black uppercase tracking-[0.2em]">© 2026 SERWIN SYSTEMS INC.</p>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}
</style>

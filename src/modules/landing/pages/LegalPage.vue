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
            <h1 class="text-5xl font-black text-[#232f3e] uppercase tracking-tighter mb-12">Legal & Terms</h1>

            <div class="prose prose-slate max-w-none space-y-12">
                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        1. Service Terms</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        By accessing or using Serwin Systems, you agree to be bound by these Terms of Service. If you
                        are using the Services on behalf of an organization, you are agreeing to these Terms for that
                        organization and promising that you have the authority to bind that organization to these terms.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        2. Acceptable Use</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        You may not use Serwin Systems for any illegal or unauthorized purpose. You must not, in the use
                        of the Service, violate any laws in your jurisdiction. Serwin Free Tier is subject to fair use
                        limitations to prevent abuse.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        3. Intellectual Property</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        All content, trademarks, service marks, trade names, logos, and icons are proprietary to Serwin
                        Systems. Nothing contained on our website or within our services should be construed as
                        granting, by implication, estoppel, or otherwise, any license or right to use any trademark
                        displayed.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2
                        class="text-xl font-black text-[#232f3e] uppercase tracking-widest border-b-2 border-[#eaeded] pb-4">
                        4. Limitation of Liability</h2>
                    <p class="text-[#545b64] font-bold text-sm leading-relaxed">
                        To the maximum extent permitted by law, Serwin Systems shall not be liable for any indirect,
                        incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                        whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible
                        losses.
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

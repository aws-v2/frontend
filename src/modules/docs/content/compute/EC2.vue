<template>
    <section>
        <h2 class="text-3xl font-black text-[#232f3e] mb-6">EC2 Instances</h2>
        <p class="text-lg text-[#545b64] font-medium mb-8 leading-relaxed">
            Elastic Compute Cloud (EC2) provides secure, resizable compute capacity in the cloud.
            It is designed to make web-scale cloud computing easier for developers.
        </p>
        <div class="space-y-6">
            <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight">Instance Types</h3>
            <p class="text-[#545b64] font-medium leading-relaxed">
                We offer a variety of instance types optimized for different use cases.
                Types comprise varying combinations of CPU, memory, storage, and networking capacity.
            </p>
            <ul
                class="space-y-4 font-bold text-[#545b64] list-disc list-inside bg-[#fafafa] p-6 border-2 border-[#eaeded]">
                <li>General Purpose (t3, m5)</li>
                <li>Compute Optimized (c5, c6g)</li>
                <li>Memory Optimized (r5, x1)</li>
                <li>Storage Optimized (i3, d2)</li>
            </ul>
        </div>
    </section>
</template>

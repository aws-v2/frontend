<template>
    <section>
        <p class="text-xl text-[#545b64] leading-relaxed mb-10 font-medium">
            Serwin Systems is built on a modern, event-driven microservices architecture designed
            for extreme low latency and horizontal scalability.
        </p>

        <h2 class="text-3xl font-black text-[#232f3e] mb-6">Core Decisions</h2>
        <div class="space-y-12">
            <div>
                <h3 class="text-xl font-black text-[#232f3e] mb-2 uppercase tracking-tight">1.
                    Event-Driven Backbone (NATS)</h3>
                <p class="text-[#545b64] font-medium leading-relaxed">
                    We use NATS JetStream as our primary communication layer. Unlike traditional
                    REST patterns, our services communicate via high-speed message subjects. This
                    decouples the system, allowing us to handle spikes in traffic without service
                    degradation.
                </p>
            </div>
            <div>
                <h3 class="text-xl font-black text-[#232f3e] mb-2 uppercase tracking-tight">2.
                    Gateway-First Routing</h3>
                <p class="text-[#545b64] font-medium leading-relaxed">
                    All traffic enters through a centralized Spring Cloud Gateway. This layer
                    handles JWT authentication, rate limiting, and request transformation before
                    passing requests to the internal mesh.
                </p>
            </div>
            <div>
                <h3 class="text-xl font-black text-[#232f3e] mb-2 uppercase tracking-tight">3.
                    Stateless Compute</h3>
                <p class="text-[#545b64] font-medium leading-relaxed">
                    Our compute nodes are designed to be entirely stateless. Resource state is
                    managed by a distributed JetStream KV store, ensuring that nodes can be added or
                    removed instantly without data loss.
                </p>
            </div>
        </div>

        <div class="mt-12 p-8 bg-[#fafafa] border-2 border-[#eaeded]">
            <h4 class="font-black text-[#232f3e] mb-4 uppercase tracking-widest text-xs">
                Architectural Stack</h4>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <div class="text-[10px] font-black text-[#ff9900] mb-1">FRONTEND</div>
                    <div class="font-bold text-sm">Vue 3 + Vite</div>
                </div>
                <div>
                    <div class="text-[10px] font-black text-[#ff9900] mb-1">MESSAGING</div>
                    <div class="font-bold text-sm">NATS JetStream</div>
                </div>
                <div>
                    <div class="text-[10px] font-black text-[#ff9900] mb-1">BACKEND</div>
                    <div class="font-bold text-sm">Go / Java (Spring)</div>
                </div>
                <div>
                    <div class="text-[10px] font-black text-[#ff9900] mb-1">ROUTING</div>
                    <div class="font-bold text-sm">Cloud Gateway</div>
                </div>
            </div>
        </div>
    </section>
</template>

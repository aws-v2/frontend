<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()
const canvasContainer = ref<HTMLElement | null>(null)
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let nodes: THREE.Mesh[] = []
let lines: THREE.Line[] = []
let animationFrameId: number

// Constants for 3D visualization
const NODE_COUNT = 40
const MAX_DISTANCE = 15
const DRIFT_SPEED = 0.005

const initThree = () => {
    if (!canvasContainer.value) return

    // Scene setup
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 30

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    canvasContainer.value.appendChild(renderer.domElement)

    // Create nodes
    const geometry = new THREE.SphereGeometry(0.3, 16, 16)

    for (let i = 0; i < NODE_COUNT; i++) {
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color('#3B82F6'),
            transparent: true,
            opacity: 0.6
        })
        const node = new THREE.Mesh(geometry, material)

        // Random positions
        node.position.x = (Math.random() - 0.5) * 60
        node.position.y = (Math.random() - 0.5) * 40
        node.position.z = (Math.random() - 0.5) * 20

        // Add random velocity for drifting
        node.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * DRIFT_SPEED,
                (Math.random() - 0.5) * DRIFT_SPEED,
                (Math.random() - 0.5) * DRIFT_SPEED
            )
        }

        nodes.push(node)
        scene.add(node)
    }

    // Line material
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3B82F6,
        transparent: true,
        opacity: 0.2
    })

    const animate = () => {
        animationFrameId = requestAnimationFrame(animate)

        // Update node positions (drifting)
        nodes.forEach(node => {
            node.position.add(node.userData.velocity)

            // Bounce off boundaries
            if (Math.abs(node.position.x) > 30) node.userData.velocity.x *= -1
            if (Math.abs(node.position.y) > 20) node.userData.velocity.y *= -1
            if (Math.abs(node.position.z) > 15) node.userData.velocity.z *= -1
        })

        // Manage connections
        // Clear old lines
        lines.forEach(line => scene.remove(line))
        lines = []

        // Create new lines based on distance
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const distance = nodes[i].position.distanceTo(nodes[j].position)
                if (distance < MAX_DISTANCE) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        nodes[i].position,
                        nodes[j].position
                    ])
                    const line = new THREE.Line(geometry, lineMaterial)
                    lines.push(line)
                    scene.add(line)
                }
            }
        }

        // Slight auto-rotation
        camera.position.x += (Math.sin(Date.now() * 0.0001) * 0.01)
        camera.lookAt(scene.position)

        renderer.render(scene, camera)
    }

    animate()
}

const handleResize = () => {
    if (!camera || !renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const handleMouseMove = (event: MouseEvent) => {
    if (!camera) return
    const mouseX = (event.clientX / window.innerWidth) - 0.5
    const mouseY = (event.clientY / window.innerHeight) - 0.5

    // Parallax effect
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05
    camera.lookAt(scene.position)
}

onMounted(() => {
    initThree()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
    cancelAnimationFrame(animationFrameId)

    // Proper cleanup
    if (renderer) {
        renderer.dispose()
        if (canvasContainer.value) {
            canvasContainer.value.removeChild(renderer.domElement)
        }
    }

    nodes.forEach(node => {
        node.geometry.dispose()
        if (Array.isArray(node.material)) {
            node.material.forEach(m => m.dispose())
        } else {
            node.material.dispose()
        }
    })

    lines.forEach(line => {
        line.geometry.dispose()
        if (Array.isArray(line.material)) {
            line.material.forEach(m => m.dispose())
        } else {
            line.material.dispose()
        }
    })
})

const triggerLogin = () => {
    toastStore.addToast('Redirecting to login...', 'info')
}
</script>

<template>
    <div class="relative min-h-screen bg-white font-sans overflow-hidden">
        <!-- 3D Background Container -->
        <div ref="canvasContainer" class="absolute inset-0 z-0 pointer-events-none opacity-60"></div>

        <!-- Navigation Bar -->
        <nav class="relative z-10 flex items-center justify-between px-8 md:px-16 py-6 bg-white/70 backdrop-blur-md">
            <!-- Logo -->
            <div class="flex items-center gap-2 cursor-pointer group">
                <div
                    class="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                    <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span class="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Serwin</span>
            </div>

            <!-- Menu items -->
            <div class="hidden md:flex items-center gap-10">
                <a href="#ai" class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">AI</a>
                <a href="#compute"
                    class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Compute</a>
                <a href="#gaming"
                    class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Gaming</a>
                <a href="#storage"
                    class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Storage</a>
            </div>

            <!-- CTA Buttons -->
            <div class="flex items-center gap-4">
                <router-link to="/login" @click="triggerLogin"
                    class="px-5 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-600 rounded-lg transition-all">
                    Login
                </router-link>
                <router-link to="/register"
                    class="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg shadow-blue-500/25">
                    Get Started
                </router-link>
            </div>
        </nav>

        <!-- Hero Section -->
        <!-- Hero Section -->
        <main class="relative z-10 max-w-7xl mx-auto px-8 md:px-16 pt-20 md:pt-32 pb-24 text-center">
            <h1 class="text-5xl md:text-7xl font-extrabold text-gray-900  leading-[1.5] mb-10">
                <p class="mb-5">Bridging Innovation and</p>
                <span
                    class="text-transparent bg-clip-text bg-gradient-to-r  from-blue-600 to-indigo-600">Connectivity</span>
            </h1>

            <p class="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-2 leading-loose font-medium">
                Empowering businesses and individuals with cutting-edge technology solutions.
                Serwin
            </p>
            <p class="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-12 leading-loose font-medium mb-10">


                connects you to the latest innovations, seamless integrations, and expert support.

                Serwin
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-10">
                <router-link to="/register"
                    class="w-full sm:w-auto px-10 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xl shadow-blue-500/30 transform hover:-translate-y-1">
                    Get Started
                </router-link>
                <button
                    class="w-full sm:w-auto px-10 py-4 text-base font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200">
                    See how it works
                </button>
            </div>
        </main>

        <!-- Trust Section -->
        <section class="relative z-10 bg-white/50 backdrop-blur-sm border-t border-gray-100 py-16">
            <div class="max-w-7xl mx-auto px-8">
                <p class="text-center text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10">Trusted By:
                </p>
                <div
                    class="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 hover:opacity-100 transition-all duration-700">
                    <!-- Safaricom -->
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 md:w-10 md:h-10 bg-[#00A34A] rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                            <span class="text-white font-black text-lg">S</span>
                        </div>
                        <span class="text-xl font-bold text-gray-800">Safaricom</span>
                    </div>

                    <!-- Equity Bank -->
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 md:w-10 md:h-10 bg-[#A32323] rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                            <span class="text-white font-black text-lg">E</span>
                        </div>
                        <span class="text-xl font-bold text-gray-800">Equity Bank</span>
                    </div>

                    <!-- KCB Bank -->
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 md:w-10 md:h-10 bg-[#006A4E] rounded-lg flex items-center justify-center shadow-lg border-2 border-[#FFE200]">
                            <span class="text-[#FFE200] font-black text-lg">KCB</span>
                        </div>
                        <span class="text-xl font-bold text-gray-800">KCB Bank</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Feature Sections -->
        <div class="relative z-10 px-8 md:px-16 py-24 space-y-32 max-w-7xl mx-auto">

            <!-- AI Section (Stargate) -->
            <section id="ai" class="grid md:grid-cols-2 gap-16 items-center">
                <div class="order-2 md:order-1">
                    <div
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                        <span class="relative flex h-2 w-2">
                            <span
                                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Next-Gen Intelligence
                    </div>
                    <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        Revolutionize your workflow with <span class="text-indigo-600">Stargate</span>
                    </h2>
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                        Unleash the power of AI with Stargate, our advanced intelligence engine. From automated
                        decision-making to predictive analytics, Stargate integrates seamlessly with your existing
                        infrastructure to drive unprecedented efficiency.
                    </p>
                    <ul class="space-y-4 mb-10">
                        <li class="flex items-center gap-3 text-gray-700 font-medium">
                            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M5 13l4 4L19 7"></path>
                            </svg>
                            Real-time neural processing
                        </li>
                        <li class="flex items-center gap-3 text-gray-700 font-medium">
                            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M5 13l4 4L19 7"></path>
                            </svg>
                            Adaptive learning models
                        </li>
                    </ul>
                    <button
                        class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25">
                        Explore Stargate
                    </button>
                </div>
                <div class="order-1 md:order-2 relative group">
                    <div
                        class="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity">
                    </div>
                    <div class="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <!-- Simulated AI Visual -->
                        <div class="aspect-video bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <svg class="w-32 h-32 text-indigo-600 animate-pulse" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
                                </path>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Compute Section (Lambda, EC2) -->
            <section id="compute" class="grid md:grid-cols-2 gap-16 items-center">
                <div class="relative group">
                    <div
                        class="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity">
                    </div>
                    <div
                        class="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 grid grid-cols-2 gap-4">
                        <div class="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <div
                                class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <h4 class="font-bold text-gray-900 mb-1">Lambda</h4>
                            <p class="text-xs text-gray-500">Serverless compute</p>
                        </div>
                        <div class="p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                            <div
                                class="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white mb-4">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                                    </path>
                                </svg>
                            </div>
                            <h4 class="font-bold text-gray-900 mb-1">EC2</h4>
                            <p class="text-xs text-gray-500">Elastic servers</p>
                        </div>
                        <div
                            class="col-span-2 p-6 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                            <div>
                                <h4 class="font-bold text-gray-900 mb-1">Managed Servers</h4>
                                <p class="text-xs text-gray-500">Zero-maintenance infrastructure</p>
                            </div>
                            <div class="flex -space-x-2">
                                <div class="w-8 h-8 rounded-full bg-blue-100 border-2 border-white"></div>
                                <div class="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                                <div class="w-8 h-8 rounded-full bg-blue-300 border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                        Scalable Infrastructure
                    </div>
                    <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        Power your apps with <span class="text-blue-600">Elastic Compute</span>
                    </h2>
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                        Scale effortlessly from simple scripts to massive enterprise systems. With <b>Lambda</b> for
                        event-driven logic and <b>EC2</b> for high-performance needs, our managed servers handle the
                        heavy lifting while you focus on code.
                    </p>
                    <button
                        class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25">
                        Deploy Now
                    </button>
                </div>
            </section>

            <!-- Storage Section (RDS, S3) -->
            <section id="storage" class="grid md:grid-cols-2 gap-16 items-center">
                <div class="order-2 md:order-1">
                    <div
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-6">
                        Secure & Reliable
                    </div>
                    <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        Built for <span class="text-emerald-600">Durability</span>
                    </h2>
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                        Your data is your most valuable asset. Protect it with our redundant <b>S3</b> object storage
                        and highly-available <b>RDS</b> database clusters. Experience 99.999999999% durability and
                        lightning-fast retrieval.
                    </p>
                    <div class="grid grid-cols-2 gap-6 mb-10">
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4">
                                    </path>
                                </svg>
                            </div>
                            <div>
                                <h5 class="font-bold text-gray-900">RDS</h5>
                                <p class="text-sm text-gray-500">Relational Databases</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-teal-100 rounded-lg text-teal-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L15 13">
                                    </path>
                                </svg>
                            </div>
                            <div>
                                <h5 class="font-bold text-gray-900">S3</h5>
                                <p class="text-sm text-gray-500">Object Storage</p>
                            </div>
                        </div>
                    </div>
                    <button
                        class="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/25">
                        Start Storing
                    </button>
                </div>
                <div class="order-1 md:order-2 relative group">
                    <div
                        class="absolute -inset-4 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity">
                    </div>
                    <div class="relative bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
                        <div
                            class="bg-gray-900 rounded-2xl overflow-hidden p-6 aspect-square flex flex-col justify-center gap-4">
                            <div class="h-1 lg:h-2 w-full bg-emerald-500/30 rounded-full overflow-hidden">
                                <div class="h-full w-2/3 bg-emerald-500"></div>
                            </div>
                            <div class="h-1 lg:h-2 w-full bg-teal-500/30 rounded-full overflow-hidden">
                                <div class="h-full w-1/2 bg-teal-500"></div>
                            </div>
                            <div class="h-1 lg:h-2 w-full bg-emerald-500/30 rounded-full overflow-hidden">
                                <div class="h-full w-4/5 bg-emerald-500"></div>
                            </div>
                            <div class="mt-4 flex justify-between items-end">
                                <div class="text-emerald-500 text-4xl lg:text-5xl font-black">99.9%</div>
                                <div class="text-gray-500 text-xs">Availability SLA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Gaming Section (GameLift, Stream) -->
            <section id="gaming" class="grid md:grid-cols-2 gap-16 items-center">
                <div class="relative group">
                    <div
                        class="absolute -inset-4 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity">
                    </div>
                    <div class="relative bg-white p-2 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div class="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative">
                            <svg class="w-16 h-16 text-rose-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z">
                                </path>
                            </svg>
                            <div
                                class="absolute bottom-4 left-4 right-4 flex justify-between items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg">
                                <span class="text-white text-xs font-bold">Latency: 12ms</span>
                                <span class="text-rose-400 text-xs font-bold">LIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider mb-6">
                        Level Up Your Infrastructure
                    </div>
                    <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        The ultimate <span class="text-rose-600">Gaming Experience</span>
                    </h2>
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                        Scale your multiplayer matches with <b>GameLift</b>, ensuring low latency and high availability
                        for players worldwide. Broadcast your gameplay with <b>Gamelist Stream</b>, our high-fidelity
                        streaming solution.
                    </p>
                    <button
                        class="px-8 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/25">
                        Start Building
                    </button>
                </div>
            </section>
        </div>

        <!-- Call to Action -->
        <section class="relative z-10 px-8 py-24">
            <div
                class="max-w-4xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl shadow-blue-500/40 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl">
                </div>

                <h2 class="text-4xl md:text-5xl font-black text-white mb-8 relative z-10">Ready to start your cloud
                    journey?</h2>
                <p class="text-blue-100 text-lg mb-12 max-w-2xl mx-auto relative z-10">Join thousands of developers and
                    businesses building the future on Serwin Cloud.</p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                    <router-link to="/register"
                        class="w-full sm:w-auto px-12 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all transform hover:scale-105">
                        Create Free Account
                    </router-link>
                    <button
                        class="w-full sm:w-auto px-12 py-4 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all border border-blue-500">
                        Contact Sales
                    </button>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="relative z-10 bg-white border-t border-gray-100 pt-20 pb-10">
            <div class="max-w-7xl mx-auto px-8 md:px-16">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    <div class="col-span-2 lg:col-span-2">
                        <div class="flex items-center gap-2 mb-6">
                            <div
                                class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span class="text-2xl font-black text-gray-900 tracking-tight">Serwin</span>
                        </div>
                        <p class="text-gray-500 leading-relaxed max-w-sm">
                            The future of cloud computing, gaming, and AI. Built for developers, by developers.
                        </p>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-6">Product</h4>
                        <ul class="space-y-4 text-sm text-gray-500">
                            <li><a href="#ai" class="hover:text-blue-600 transition-colors">AI & ML</a></li>
                            <li><a href="#compute" class="hover:text-blue-600 transition-colors">Compute</a></li>
                            <li><a href="#storage" class="hover:text-blue-600 transition-colors">Storage</a></li>
                            <li><a href="#gaming" class="hover:text-blue-600 transition-colors">Gaming</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-6">Platform</h4>
                        <ul class="space-y-4 text-sm text-gray-500">
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Documentation</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">API Reference</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Security</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Global Network</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-6">Company</h4>
                        <ul class="space-y-4 text-sm text-gray-500">
                            <li><a href="#" class="hover:text-blue-600 transition-colors">About</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Careers</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Contact</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                </div>
                <div class="pt-10 border-t border-gray-100 flex flex-col md:row items-center justify-between gap-6">
                    <p class="text-sm text-gray-400">© 2026 Serwin Cloud. All rights reserved.</p>
                    <div class="flex items-center gap-6">
                        <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors">
                            <span class="sr-only">Twitter</span>
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z">
                                </path>
                            </svg>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors">
                            <span class="sr-only">GitHub</span>
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
                                </path>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* Force smooth transitions for Tailwind classes */
.transition-all {
    transition-duration: 300ms;
}

/* Add custom font if needed, otherwise using system-sans */
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-sans {
    font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
</style>

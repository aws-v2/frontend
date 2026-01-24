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
                <router-link to="/sagemaker"
                    class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">AI</router-link>
                <router-link to="/compute"
                    class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Compute</router-link>
                <router-link to="/gaming"
                    class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Gaming</router-link>
                <router-link to="/s3"
                    class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Storage</router-link>
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

        <!-- Dynamic Feature Sections -->
        <div class="relative z-10 space-y-40 pb-32">

            <!-- Floating Background Elements (Decorative) -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    class="absolute top-[10%] left-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] animate-pulse">
                </div>
                <div
                    class="absolute top-[40%] right-[-5%] w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-[150px]">
                </div>
                <div class="absolute bottom-[20%] left-[10%] w-80 h-80 bg-emerald-400/5 rounded-full blur-[100px] animate-bounce"
                    style="animation-duration: 10s"></div>
            </div>

            <!-- AI Section: Bento Reveal -->
            <section id="ai" class="max-w-7xl mx-auto px-8 md:px-16">
                <div class="flex flex-col lg:flex-row gap-16 items-center">
                    <div class="lg:w-1/2">
                        <div
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/10 text-indigo-600 text-[10px] font-black uppercase tracking-tighter mb-8 border border-indigo-200/50">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                            Neural Protocol Active
                        </div>
                        <h2 class="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter">
                            The Mind of <span class="text-indigo-600 italic">Stargate</span>
                        </h2>
                        <p class="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                            Beyond standard automation. Stargate is a living intelligence layer that learns, adapts, and
                            evolves with your business logic.
                        </p>
                        <div class="flex flex-wrap gap-4">
                            <button
                                class="group relative px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl overflow-hidden transition-all hover:pr-12">
                                <span class="relative z-10 text-lg">Initialize AI</span>
                                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-all"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="lg:w-1/2 grid grid-cols-2 gap-4 relative">
                        <!-- Bento Grid Items -->
                        <div
                            class="col-span-2 p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 group hover:-translate-y-2 transition-all duration-500">
                            <div class="flex items-center gap-4 mb-4">
                                <div
                                    class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
                                        </path>
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-black text-gray-900">Predictive Core</h3>
                            </div>
                            <p class="text-gray-500 font-medium">Anticipate trends before they manifest with our
                                adaptive neural network.</p>
                        </div>
                        <div
                            class="p-6 bg-indigo-600 rounded-[2.5rem] text-white flex flex-col justify-end group hover:rotate-3 transition-all duration-500">
                            <span class="text-4xl font-black mb-2">98%</span>
                            <span class="text-xs font-bold uppercase tracking-widest opacity-80">Accuracy Rate</span>
                        </div>
                        <div
                            class="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-xl flex items-center justify-center group hover:-rotate-3 transition-all duration-500">
                            <div class="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center relative">
                                <span
                                    class="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200 animate-spin"
                                    style="animation-duration: 8s"></span>
                                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Compute Section: Terminal Hacker Style -->
            <section id="compute" class="relative py-20 overflow-hidden">
                <div class="max-w-7xl mx-auto px-8 md:px-16 flex flex-col lg:flex-row-reverse gap-20 items-center">
                    <div class="lg:w-1/2">
                        <div
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-tighter mb-8 border border-blue-200/50">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            Instance: Ready
                        </div>
                        <h2 class="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter">
                            Pure <span class="bg-blue-600 text-white px-4 rounded-lg">Performance</span>
                        </h2>
                        <div class="space-y-6 mb-12">
                            <div class="flex gap-4 items-start">
                                <div
                                    class="mt-1 w-6 h-6 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                    1</div>
                                <p class="text-lg text-gray-600 font-medium"><b>Lambda Functions</b> for event-driven
                                    magic.</p>
                            </div>
                            <div class="flex gap-4 items-start">
                                <div
                                    class="mt-1 w-6 h-6 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                    2</div>
                                <p class="text-lg text-gray-600 font-medium"><b>EC2 Instances</b> for raw, unbridled
                                    power.</p>
                            </div>
                            <div class="flex gap-4 items-start">
                                <div
                                    class="mt-1 w-6 h-6 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                    3</div>
                                <p class="text-lg text-gray-600 font-medium">Automatic scaling that breathes with your
                                    traffic.</p>
                            </div>
                        </div>
                        <router-link to="/lambda"
                            class="inline-block px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 transform hover:-translate-y-1">
                            Deploy Now
                        </router-link>
                    </div>

                    <div class="lg:w-1/2 w-full">
                        <div
                            class="relative bg-gray-900 rounded-[2.5rem] p-4 lg:p-8 shadow-[0_40px_100px_-20px_rgba(30,58,138,0.4)] transform lg:-rotate-2 border border-blue-500/20 group">
                            <!-- Terminal Header -->
                            <div class="flex items-center gap-2 mb-6 ml-2">
                                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                <span class="ml-4 text-xs font-mono text-gray-500">serwin-cloud --deploy</span>
                            </div>
                            <!-- Terminal Content -->
                            <div class="font-mono text-sm leading-relaxed space-y-2 mb-4">
                                <p class="text-blue-400"># Initializing managed infrastructure...</p>
                                <p class="text-white"><span class="text-emerald-400">✔</span> Lambda: handler.js
                                    successfully deployed</p>
                                <p class="text-white"><span class="text-emerald-400">✔</span> EC2-t3.large: Ready
                                    (us-east-1)</p>
                                <p class="text-white"><span class="text-emerald-400">✔</span> Memory: 16GB allocated</p>
                                <div class="flex items-center gap-2 mt-4">
                                    <span class="text-blue-400">$</span>
                                    <span class="w-2 h-5 bg-blue-400 animate-pulse"></span>
                                </div>
                            </div>
                            <!-- Floating Metric Card Over Terminal -->
                            <div
                                class="absolute -bottom-10 -right-6 md:-right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 group-hover:translate-x-4 transition-transform">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Uptime</div>
                                        <div class="text-2xl font-black text-gray-900">99.99%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Storage Section: 3D Stack -->
            <section id="storage" class="max-w-7xl mx-auto px-8 md:px-16">
                <div class="flex flex-col lg:flex-row gap-16 items-center">
                    <div class="lg:w-1/2">
                        <div
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/10 text-emerald-600 text-[10px] font-black uppercase tracking-tighter mb-8 border border-emerald-200/50">
                            Immutable Data Layer
                        </div>
                        <h2 class="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter">
                            Infinite <span class="text-emerald-600">Storage</span>
                        </h2>
                        <p class="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                            Scale without limits. Whether it's the raw simplicity of <b>S3</b> or the robust complexity
                            of <b>RDS</b>, we ensure your data is safe, fast, and always where you need it.
                        </p>
                        <div class="grid grid-cols-2 gap-8">
                            <div>
                                <h4 class="text-lg font-black text-gray-900 mb-2">Relational Focus</h4>
                                <p class="text-sm text-gray-500">Fully managed RDS with automated failover and zero-lag
                                    indexing.</p>
                            </div>
                            <div>
                                <h4 class="text-lg font-black text-gray-900 mb-2">Object Agnostic</h4>
                                <p class="text-sm text-gray-500">S3 storage designed for high-concurrency access and
                                    deep archiving.</p>
                            </div>
                        </div>
                        <router-link to="/s3"
                            class="inline-block mt-10 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/30 transform hover:-translate-y-1">
                            Start Storing
                        </router-link>
                    </div>

                    <div class="lg:w-1/2 relative flex items-center justify-center h-[400px]">
                        <!-- Isometric Stacked Cards -->
                        <router-link to="/rds"
                            class="absolute w-64 h-64 bg-emerald-600 rounded-[3rem] transform rotate-[30deg] -translate-x-10 -translate-y-10 shadow-2xl skew-y-12 transition-all hover:translate-y-[-2rem] group cursor-pointer">
                            <div class="absolute top-8 left-8 text-white">
                                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4">
                                    </path>
                                </svg>
                                <span class="block mt-4 text-2xl font-black">RDS</span>
                            </div>
                        </router-link>
                        <router-link to="/s3"
                            class="absolute w-64 h-64 bg-white border-2 border-emerald-100 rounded-[3rem] transform rotate-[30deg] shadow-2xl skew-y-12 translate-x-10 translate-y-10 flex items-center justify-center transition-all hover:translate-y-[2.5rem] cursor-pointer">
                            <div class="text-emerald-600 text-center">
                                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L15 13">
                                    </path>
                                </svg>
                                <span class="text-xl font-black">S3 BUCKET</span>
                            </div>
                        </router-link>
                    </div>
                </div>
            </section>

            <!-- Gaming Section: Cyberpunk Neon -->
            <section id="gaming" class="max-w-7xl mx-auto px-8 md:px-16 pt-20">
                <div
                    class="relative bg-gray-900 rounded-[3rem] p-12 lg:p-24 overflow-hidden group shadow-[0_50px_100px_-30px_rgba(244,63,94,0.3)]">
                    <!-- Background Design -->
                    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-500/10 to-transparent">
                    </div>
                    <div
                        class="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-500/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000">
                    </div>
                    <div class="absolute top-10 right-10 flex gap-2">
                        <div class="w-1 h-8 bg-rose-500 animate-pulse"></div>
                        <div class="w-1 h-12 bg-rose-500 animate-pulse" style="animation-delay: 0.2s"></div>
                        <div class="w-1 h-6 bg-rose-500 animate-pulse" style="animation-delay: 0.4s"></div>
                    </div>

                    <div class="relative z-10 flex flex-col lg:flex-row gap-20 items-center">
                        <div class="lg:w-3/5">
                            <div
                                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-rose-400 text-[10px] font-black uppercase tracking-tighter mb-8 border border-white/10">
                                Low Latency Protocol v2.4
                            </div>
                            <h2 class="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                                Play Without <span
                                    class="text-rose-500 underline decoration-4 underline-offset-8 decoration-rose-500/30">Limits</span>
                            </h2>
                            <p class="text-xl text-gray-400 mb-12 leading-relaxed">
                                Forge massive multiplayer worlds with <b>GameLift</b> and broadcast every frame in 4K
                                with <b>Gamelist Stream</b>. It's not just hosting; it's total control.
                            </p>
                            <div class="flex flex-col sm:flex-row gap-6">
                                <button
                                    class="px-10 py-5 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 active:scale-95">
                                    Launch Gamelift
                                </button>
                                <button
                                    class="px-10 py-5 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                    View Stream Lab
                                </button>
                            </div>
                        </div>
                        <div class="lg:w-2/5 w-full flex justify-center lg:justify-end">
                            <div
                                class="relative w-full aspect-square max-w-[300px] border-2 border-rose-500/20 rounded-full p-8 flex items-center justify-center">
                                <div class="absolute inset-0 border-2 border-rose-500/10 rounded-full scale-125 border-dashed animate-spin"
                                    style="animation-duration: 15s"></div>
                                <div
                                    class="w-full h-full bg-rose-600 rounded-full flex items-center justify-center p-8 group-hover:scale-110 transition-transform duration-700 shadow-[0_0_60px_-10px_rgba(244,63,94,0.6)]">
                                    <svg class="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Over-the-top Call to Action -->
        <section class="relative z-10 px-8 py-32">
            <div class="max-w-6xl mx-auto relative group">
                <!-- Floating Decorative Background -->
                <div
                    class="absolute -inset-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 rounded-[4rem] opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-1000">
                </div>

                <div class="relative bg-gray-900 rounded-[4rem] p-12 md:p-24 text-center overflow-hidden">
                    <div
                        class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10">
                    </div>

                    <h2
                        class="text-5xl md:text-8xl font-black text-white mb-10 leading-tight relative z-10 tracking-tighter">
                        Stop Dreaming.<br />Start <span
                            class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Deploying.</span>
                    </h2>
                    <p class="text-gray-400 text-xl md:text-2xl mb-16 max-w-2xl mx-auto relative z-10">Get the
                        infrastructure you deserve. Zero friction, infinite potential.</p>

                    <div class="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                        <router-link to="/register"
                            class="group w-full sm:w-auto px-12 py-6 bg-white text-gray-900 font-black text-xl rounded-3xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-2xl">
                            Get Started Free
                        </router-link>
                        <button
                            class="w-full sm:w-auto px-12 py-6 bg-gray-800 text-white font-black text-xl rounded-3xl border border-white/10 hover:bg-white/5 transition-all">
                            Talk to Engineers
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="relative z-10 bg-white border-t border-gray-100 pt-24 pb-12">
            <div class="max-w-7xl mx-auto px-8 md:px-16">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
                    <div class="col-span-1 lg:col-span-2">
                        <div class="flex items-center gap-3 mb-8">
                            <div
                                class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span class="text-3xl font-black text-gray-900 tracking-tighter">Serwin</span>
                        </div>
                        <p class="text-gray-500 text-lg leading-relaxed max-w-sm font-medium">
                            Engineered for those who build the future. The definitive platform for AI, high-performance
                            compute, and next-gen gaming.
                        </p>
                    </div>
                    <div>
                        <h4 class="font-black text-gray-900 text-lg mb-8 uppercase tracking-widest">Solutions</h4>
                        <ul class="space-y-5 text-gray-500 font-bold">
                            <li><a href="#ai" class="hover:text-blue-600 transition-colors">AI Processing</a></li>
                            <li><a href="#compute" class="hover:text-blue-600 transition-colors">Edge Compute</a></li>
                            <li><a href="#storage" class="hover:text-blue-600 transition-colors">Data Flow</a></li>
                            <li><a href="#gaming" class="hover:text-blue-600 transition-colors">Game Hosting</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-black text-gray-900 text-lg mb-8 uppercase tracking-widest">Developers</h4>
                        <ul class="space-y-5 text-gray-500 font-bold">
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Open Documentation</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">System Status</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">API Keys</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Global SDK</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-black text-gray-900 text-lg mb-8 uppercase tracking-widest">Inside</h4>
                        <ul class="space-y-5 text-gray-500 font-bold">
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Our Vision</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Engineering Blog</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Privacy Guard</a></li>
                            <li><a href="#" class="hover:text-blue-600 transition-colors">Security Audit</a></li>
                        </ul>
                    </div>
                </div>
                <div
                    class="pt-12 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                    <p class="text-gray-400 font-bold text-sm">© 2026 Serwin Cloud Systems Inc. All protocols reserved.
                    </p>
                    <div class="flex items-center gap-8">
                        <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z">
                                </path>
                            </svg>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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

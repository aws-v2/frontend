import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Service for loading 3D assets (GLTF/GLB) with proper error handling and fallback support.
 */
class AssetLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  /**
   * Loads a GLTF/GLB file and returns the scene.
   * @param {string} url - Path to the asset
   * @returns {Promise<THREE.Group>}
   */
  async loadModel(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url).clone();
    }

    return new Promise((resolve, reject) => {
      console.log(`[AssetLoader] Loading: ${url}`);
      this.loader.load(
        url,
        (gltf) => {
          this.cache.set(url, gltf.scene);
          resolve(gltf.scene);
        },
        (xhr) => {
          const percent = (xhr.loaded / xhr.total) * 100;
          if (percent < 100) {
            console.debug(`[AssetLoader] ${url}: ${Math.round(percent)}%`);
          }
        },
        (error) => {
          console.error(`[AssetLoader] Failed to load ${url}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Helper to resolve common Godot export issues (like missing textures)
   * by applying a default material to meshes without valid materials.
   * @param {THREE.Object3D} object 
   */
  applyFallbacks(object) {
    const defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.7,
      metalness: 0.2
    });

    object.traverse((child) => {
      if (child.isMesh) {
        // If material is missing or has a broken texture (placeholder check)
        if (!child.material || (child.material.map && !child.material.map.image)) {
          console.warn(`[AssetLoader] Applying fallback material to: ${child.name}`);
          child.material = defaultMaterial;
        }
      }
    });
  }
}

export const assetLoader = new AssetLoader();

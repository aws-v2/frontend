<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Add from .env</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </header>
      
      <div class="modal-body">
        <p class="description">
          Paste your .env contents to add multiple environment variables at once. Read the <a href="#">docs</a> for correct syntax.
        </p>
        
        <div class="textarea-wrapper">
          <textarea 
            v-model="envText"
            placeholder="KEY_1=VALUE_1
KEY_2=VALUE_2
KEY_3=VALUE_3"
          ></textarea>
        </div>

        <button class="file-upload">
          Choose a file <span class="upload-icon">↑</span>
        </button>
      </div>

      <footer class="modal-footer">
        <button 
          class="btn-add" 
          :disabled="!envText.trim()"
          @click="addVariables"
        >
          Add variables
        </button>
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close', 'add'])
const envText = ref('')

const addVariables = () => {
  emit('add', envText.value)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  width: 540px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-header {
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 0 24px 24px;
}

.description {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
  line-height: 1.5;
}

.description a {
  color: #7b3fe4;
  text-decoration: none;
}

.textarea-wrapper {
  background-color: #000;
  border: 2px solid #3d2b5c;
  border-radius: 4px;
  margin-bottom: 16px;
}

textarea {
  width: 100%;
  height: 180px;
  background: none;
  border: none;
  color: #fff;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 13px;
  resize: none;
  outline: none;
}

.file-upload {
  background: none;
  border: none;
  color: #7b3fe4;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #1a1a1a;
  display: flex;
  gap: 12px;
}

.btn-add {
  background-color: #1a1a1a;
  color: #444;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:not(:disabled) {
  background-color: #fff;
  color: #000;
}

.btn-cancel {
  background: none;
  border: 1px solid #333;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  border-color: #555;
}
</style>

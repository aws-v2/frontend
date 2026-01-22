<template>
  <div class="connect-dropdown">
    <div class="section-title">Outbound</div>
    <div class="divider"></div>
    <div class="content">
      <h3>Outbound IP Addresses</h3>
      <p>Network requests from your service to the public internet will come from one of the following IP addresses or ranges.</p>
      <p class="notice">These IPs are not unique to your service or workspace. They are shared by other Render services in the same region.</p>
      
      <div class="ip-box">
        <div class="ip-list">
          <div>74.220.48.0/24</div>
          <div>74.220.56.0/24</div>
        </div>
        <button class="copy-btn">📑</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.connect-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: #0c0c0c;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  width: 380px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 1000;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  margin-bottom: 12px;
}

.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #7b3fe4 50%, transparent 100%);
  margin-bottom: 24px;
}

.content h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.content p { font-size: 12px; color: #999; line-height: 1.5; margin-bottom: 12px; }
.notice { font-style: italic; color: #666 !important; }

.ip-box {
  background-color: #000;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.ip-list { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #ccc; line-height: 1.8; }
.copy-btn { background: none; border: none; color: #666; cursor: pointer; }
</style>

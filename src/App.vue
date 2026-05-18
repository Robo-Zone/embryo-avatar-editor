<script setup lang="ts">
import { useAvatarStore } from './store/avatar'
import ManageView from './views/ManageView.vue'
import EditView from './views/EditView.vue'
import DeployView from './views/DeployView.vue'

const store = useAvatarStore()
</script>

<template>
  <div class="cute-app-container">
    <header class="cute-header">
      <div class="logo-zone">
        <span class="logo-icon">🎨</span>
        <h1>Embryo Avatar <span class="badge">v3.0 Engine</span></h1>
      </div>
      <nav class="top-nav-tabs">
        <button :class="['nav-btn', { active: store.currentTab.value === 'manage' }]" @click="store.currentTab.value = 'manage'">
          🗂️ 仓库管理
        </button>
        <button :class="['nav-btn', { active: store.currentTab.value === 'edit' }]" @click="store.currentTab.value = 'edit'">
          ✨ 挂件加工
        </button>
        <button :class="['nav-btn', { active: store.currentTab.value === 'io' }]" @click="store.currentTab.value = 'io'">
          🚀 烧录部署
        </button>
      </nav>
    </header>

    <div class="main-layout">
      <aside class="cute-sidebar" v-if="store.currentTab.value === 'manage'">
        <span class="aside-label">快速克隆原型：</span>
        <button class="action-add-btn" @click="store.createNewAvatarWithTemplate('humanoid')">👤 新建人形</button>
        <button class="action-add-btn" @click="store.createNewAvatarWithTemplate('canine')">🐶 新建狗形</button>
      </aside>

      <main class="cute-content-stage">
        <Transition name="page-fade" mode="out-in">
          <div :key="store.currentTab.value" class="stage-wrapper">
            <ManageView v-if="store.currentTab.value === 'manage'" />
            <EditView v-else-if="store.currentTab.value === 'edit'" />
            <DeployView v-else-if="store.currentTab.value === 'io'" />
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style>
/* ==========================================================================
   全量整合样式表 - 包含完整的物理骨架与萌系皮肤配置
   ========================================================================== */
:root {
  --primary: #ff758f;
  --primary-hover: #ff4d6d;
  --bg-color: #fff0f3;
  --sidebar-bg: #ffe5ec;
  --text-dark: #4a4e69;
  --radius-lg: 24px;
  --radius-md: 12px;
}

/* 全局基底重置 */
body {
  background-color: var(--bg-color);
  margin: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text-dark);
}

/* 核心外壳：强行锁死总宽高，防止子页面撑爆或缩水 */
.cute-app-container {
  width: 1150px;
  height: 720px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 40px rgba(255, 117, 143, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 4px solid #ffffff;
}

/* 顶部流线型彩带 Header */
.cute-header {
  background: linear-gradient(135deg, #ff758f, #ff8fa3);
  padding: 18px 28px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(255, 117, 143, 0.15);
  z-index: 10;
}

.logo-zone {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-zone h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.badge {
  background: rgba(255, 255, 255, 0.25);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 20px;
  vertical-align: middle;
  font-weight: normal;
}

/* 顶部胶囊级页签导航 */
.top-nav-tabs {
  display: flex;
  gap: 10px;
}

.top-nav-tabs .nav-btn {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.top-nav-tabs .nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.top-nav-tabs .nav-btn.active {
  background: #ffffff;
  color: var(--primary);
  box-shadow: 0 4px 10px rgba(255, 117, 143, 0.2);
}

/* 分栏承载容器 */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden; /* 关键：切断全局滚动 */
}

/* 左侧快捷边栏 */
.cute-sidebar {
  width: 180px;
  background-color: var(--sidebar-bg);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid rgba(255, 117, 143, 0.1);
}

.aside-label {
  font-size: 12px;
  color: #a26974;
  margin-bottom: 4px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.action-add-btn {
  background: #ffffff;
  border: 2px solid var(--primary);
  padding: 12px;
  border-radius: var(--radius-md);
  font-weight: bold;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.2);
  text-align: left;
}

.action-add-btn:hover {
  transform: scale(1.03) translateX(3px);
  background: #fff5f6;
  box-shadow: 0 4px 10px rgba(255, 117, 143, 0.1);
}

/* 右侧核心展示舞台（锁死高度，内容多时自动在这里优雅滚动） */
.cute-content-stage {
  flex: 1;
  height: 100%;
  padding: 28px;
  overflow-y: auto;
  box-sizing: border-box;
  background-color: #fafbfc;
}

.stage-wrapper {
  height: 100%;
}

/* 页面淡入淡出无缝柔和转场动效 */
.page-fade-enter-active, 
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
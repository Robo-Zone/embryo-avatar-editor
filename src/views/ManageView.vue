<script setup lang="ts">
import { useAvatarStore } from '../store/avatar'
const store = useAvatarStore()
</script>

<template>
  <div class="view-body animate-fade">
    <div class="view-header">
      <h3>🗂️ 我的虚拟形象仓库</h3>
    </div>
    
    <div class="avatar-grid">
      <div 
        v-for="item in store.avatarList.value" 
        :key="item.id" 
        :class="['avatar-card', { active: store.activeAvatarId.value === item.id }]"
        @click="store.setActiveAvatar(item.id)"
      >
        <div class="card-badge">{{ item.archetypeId === 'humanoid' ? '👤 人形' : '🐶 犬形' }}</div>
        <div class="card-preview-icon">🤖</div>
        <h4>{{ item.name }}</h4>
        <p>{{ item.description }}</p>
        
        <div class="card-actions" @click.stop>
          <button class="btn-action danger" @click="store.deleteAvatar(item.id)">丢弃形象</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-body { display: flex; flex-direction: column; gap: 20px; }
.view-header h3 { margin: 0; font-size: 20px; color: #4a4e69; font-weight: 800; }

/* 真正的多列卡片网格系统 */
.avatar-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 20px; 
  padding: 4px;
}

.avatar-card { 
  background: #ffffff;
  border: 3px solid #f1f5f9; 
  border-radius: 20px; 
  padding: 24px; 
  cursor: pointer; 
  text-align: center; 
  position: relative;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.2); 
}

.avatar-card:hover {
  transform: translateY(-5px);
  border-color: #ff758f;
  box-shadow: 0 12px 24px rgba(255, 117, 143, 0.12);
}

.avatar-card.active { 
  border-color: #ff758f; 
  background: #fff5f6; 
}

.card-badge {
  position: absolute; top: 12px; left: 12px; background: #e2e8f0;
  font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: bold; color: #64748b;
}
.avatar-card.active .card-badge { background: #ff758f; color: white; }

.card-preview-icon { font-size: 44px; margin: 10px 0; }
.avatar-card h4 { margin: 6px 0; font-size: 18px; color: #2d3748; }
.avatar-card p { font-size: 13px; color: #718096; margin: 0 0 16px 0; }

.card-actions { 
  border-top: 2px dashed #edf2f7; 
  padding-top: 14px; 
  display: flex; 
  justify-content: center; 
}

/* 统一的高级质感按钮 */
.btn-action.danger { 
  background: #fee2e2; 
  border: none; 
  color: #ef4444; 
  padding: 8px 16px; 
  border-radius: 10px; 
  font-weight: bold; 
  cursor: pointer; 
  font-size: 13px;
  transition: background 0.2s;
}
.btn-action.danger:hover { background: #fca5a5; color: #ffffff; }
</style>
<script setup lang="ts">
import { computed } from 'vue'
import { useAvatarStore, ASSET_LIBRARY } from '../store/avatar'
import AvatarCanvas from '../components/AvatarCanvas.vue'

const store = useAvatarStore()

// 自动清洗过滤出适配当前动物原型的零件
const filteredAssets = computed(() => {
  if (!store.currentAvatar.value) return []
  return ASSET_LIBRARY.filter(asset => asset.archetypeId === store.currentAvatar.value.archetypeId)
})

const currentPart = computed(() => {
  if (!store.currentAvatar.value) return null
  return store.currentAvatar.value.parts.find(p => p.id === store.selectedPartId.value) || null
})
</script>

<template>
  <div class="editor-layout" v-if="store.currentAvatar.value">
    <div class="canvas-panel">
      <AvatarCanvas 
        :parts="store.currentAvatar.value.parts" 
        :archetypeId="store.currentAvatar.value.archetypeId" 
      />
      <div class="engine-tip">
        <span class="pulse-dot"></span>
        已激活【{{ store.currentArchetypeConfig.value?.name }}】物理框架
      </div>
    </div>
    
    <div class="edit-control-panel">
      <div class="panel-block">
        <h4>🎒 适配当前形态的资产库 <span class="counter">({{ filteredAssets.length }}个预设)</span></h4>
        <div class="asset-shelf">
          <div 
            v-for="asset in filteredAssets" 
            :key="asset.id" 
            class="asset-thumb-tile"
            @click="store.addPartToCurrent(asset)"
          >
            <div class="tile-icon">📦</div>
            <div class="tile-name">{{ asset.name }}</div>
          </div>
        </div>
      </div>

      <div class="panel-block">
        <h4>🥞 骨骼槽位堆叠 (点击选中精调)</h4>
        <div class="layer-strip">
          <div 
            v-for="part in store.currentAvatar.value.parts" 
            :key="part.id"
            :class="['layer-chip', { selected: store.selectedPartId.value === part.id }]"
            @click="store.selectedPartId.value = part.id"
          >
            <span class="slot-tag">#{{ part.slotKey }}</span>
            <span class="part-name">{{ part.name }}</span>
            <button class="close-mini" @click.stop="store.removePartFromCurrent(part.id)">×</button>
          </div>
          <div v-if="store.currentAvatar.value.parts.length === 0" class="empty-layer-tip">
            还没有任何挂件，请点击上方资产库添加 👆
          </div>
        </div>
      </div>

      <div class="panel-block precision-controls" v-if="currentPart">
        <h4>🎛️ 空间属性精准映射: <span class="highlight">{{ currentPart.name }}</span></h4>
        
        <div class="control-row">
          <div class="row-info"><span>水平位移 (X轴)</span><strong>{{ currentPart.x }}px</strong></div>
          <input type="range" min="0" max="300" v-model.number="currentPart.x" class="cute-slider" />
        </div>
        
        <div class="control-row">
          <div class="row-info"><span>垂直位移 (Y轴)</span><strong>{{ currentPart.y }}px</strong></div>
          <input type="range" min="0" max="300" v-model.number="currentPart.y" class="cute-slider" />
        </div>
        
        <div class="control-row">
          <div class="row-info"><span>骨骼缩放 (Scale)</span><strong>{{ currentPart.scale.toFixed(1) }}x</strong></div>
          <input type="range" min="0.4" max="3" step="0.1" v-model.number="currentPart.scale" class="cute-slider" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-layout { display: flex; gap: 28px; height: 100%; align-items: flex-start; }
.canvas-panel { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 310px; }

.engine-tip {
  background: #e0f2fe; color: #0369a1; padding: 8px 14px; border-radius: 12px;
  font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 8px;
}
.pulse-dot { width: 8px; height: 8px; background: #0284c7; border-radius: 50%; display: inline-block; animation: blinker 1.5s linear infinite; }
@keyframes blinker { 50% { opacity: 0; } }

.tips { font-size: 11px; color: #94a3b8; margin: 0; }

/* 右侧控制面板 */
.edit-control-panel { flex: 1; display: flex; flex-direction: column; gap: 16px; max-height: 620px; overflow-y: auto; padding-right: 4px; }
.panel-block { background: #ffffff; border: 2px solid #f1f5f9; border-radius: 16px; padding: 16px; }
.panel-block h4 { margin: 0 0 14px 0; font-size: 14px; color: #475569; font-weight: 800; display: flex; justify-content: space-between; }
.counter { color: #94a3b8; font-weight: normal; font-size: 12px; }

/* 挂件资产磁贴 */
.asset-shelf { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
.asset-thumb-tile {
  background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 12px 8px;
  text-align: center; cursor: pointer; transition: all 0.2s;
}
.asset-thumb-tile:hover {
  border-color: #ff758f; background: #fff5f6; transform: scale(1.04);
}
.tile-icon { font-size: 24px; margin-bottom: 4px; }
.tile-name { font-size: 12px; font-weight: bold; color: #4a5568; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 图层控制 */
.layer-strip { display: flex; flex-direction: column; gap: 8px; }
.layer-chip {
  display: flex; align-items: center; background: #f1f5f9; padding: 10px 14px; 
  border-radius: 12px; font-size: 13px; cursor: pointer; transition: all 0.15s; border: 2px solid transparent;
}
.layer-chip:hover { background: #e2e8f0; }
.layer-chip.selected { background: #fff5f6; border-color: #ff758f; }
.slot-tag { font-family: monospace; font-weight: bold; color: #94a3b8; margin-right: 8px; }
.layer-chip.selected .slot-tag { color: #ff758f; }
.part-name { font-weight: bold; color: #334155; flex: 1; }
.close-mini { background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px; }
.close-mini:hover { color: #ef4444; }
.empty-layer-tip { font-size: 12px; color: #94a3b8; text-align: center; padding: 10px; }

/* 滑块属性调节 */
.precision-controls { border-color: #ffe5ec; }
.highlight { color: #ff758f; }
.control-row { margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; }
.row-info { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
.row-info strong { color: #334155; font-family: monospace; }

/* 萌系粉嫩物理滑块 */
.cute-slider {
  -webkit-appearance: none; width: 100%; height: 8px; background: #e2e8f0; border-radius: 5px; outline: none;
}
.cute-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px; background: #ff758f; border-radius: 50%; cursor: pointer; transition: transform 0.1s;
}
.cute-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
</style>
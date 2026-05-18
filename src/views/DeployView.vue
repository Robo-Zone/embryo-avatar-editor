<script setup lang="ts">
import { ref } from 'vue'
import { useAvatarStore } from '../store/avatar'

const store = useAvatarStore()
const codeArea = ref<string>('')

const exportFullBackup = () => {
  if (!store.currentAvatar.value) return
  const dataStr = JSON.stringify(store.currentAvatar.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `工程备份_${store.currentAvatar.value.name}.json`
  link.click()
}

const handleImportFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const obj = JSON.parse(event.target?.result as string)
      if (obj.archetypeId && obj.parts) {
        obj.id = 'imported_' + Date.now()
        store.avatarList.value.unshift(obj)
        store.setActiveAvatar(obj.id)
        alert('✨ 形象同步恢复成功！已存入仓库。')
      }
    } catch {
      alert('无法解析，配置文件损坏 QAQ')
    }
  }
  reader.readAsText(target.files[0])
}

// 映射函数：解耦插槽并进行数值化压缩，极大程度节省单片机 Flash 空间
const getSlotIndex = (key: string) => {
  const map: Record<string, number> = { body: 0, face: 1, head: 1, mouth: 2, eyes: 3, hair: 4, ears: 4 }
  return map[key] ?? 5
}

const generateEmbeddedAssets = () => {
  const avatar = store.currentAvatar.value
  if (!avatar) return
  
  const compactJson = {
    type: avatar.archetypeId === 'humanoid' ? 1 : 2,
    count: avatar.parts.length,
    layers: avatar.parts.map(p => [
      getSlotIndex(p.slotKey),
      Math.round(p.x),
      Math.round(p.y),
      parseFloat(p.scale.toFixed(1))
    ])
  }

  let cHeader = `// ==========================================================\n`
  cHeader += `//  Embryo Avatar v3.1 - Generated Header For ESP32/Arduino \n`
  cHeader += `// ==========================================================\n\n`
  cHeader += `typedef struct {\n  uint8_t slot_type;  // 0:body, 1:face/head, 2:mouth, 3:eyes, 4:hair/ears\n  int16_t pos_x;\n  int16_t pos_y;\n  float asset_scale;\n} RenderLayer;\n\n`
  cHeader += `const uint8_t CORE_LAYER_COUNT = ${avatar.parts.length};\n`
  cHeader += `RenderLayer embryoCharacter[${avatar.parts.length}] = {\n`
  
  avatar.parts.forEach((p, idx) => {
    cHeader += `  { ${getSlotIndex(p.slotKey)}, ${Math.round(p.x)}, ${Math.round(p.y)}, ${p.scale.toFixed(1)}f }`
    cHeader += idx < avatar.parts.length - 1 ? ',\n' : '\n'
  })
  cHeader += `};`

  codeArea.value = `// [1. 紧凑型低带宽单片机 JSON 串]\n${JSON.stringify(compactJson)}\n\n// [2. 免解析零开销 C 语言直接内存映射数组]\n${cHeader}`
}
</script>

<template>
  <div class="view-body animate-fade">
    <div class="view-header">
      <h3>🚀 跨平台编译与固件端烧录部署</h3>
    </div>

    <div class="io-grid">
      <div class="io-card">
        <div class="io-icon">🌐</div>
        <h4>标准网络全量工程导出</h4>
        <p>导出包含网格图元信息与动效常数对应的全量配置，主要用于云端玩家分享、工程跨电脑恢复等。</p>
        <div class="btn-group">
          <button class="btn-action primary" @click="exportFullBackup">生成全量工程 JSON</button>
          <label class="btn-action secondary">
            读取备份工程恢复
            <input type="file" accept=".json" style="display:none" @change="handleImportFile" />
          </label>
        </div>
      </div>

      <div class="io-card focus">
        <div class="io-icon">📟</div>
        <h4>ESP32 / MCU 固件数据瘦身</h4>
        <p>一键转为超轻量寄存器快照流，剥离网页段长字符，完美适配单片机无开销直接映射渲染。</p>
        <button class="btn-action success" @click="generateEmbeddedAssets">编译并提取固件数据</button>
      </div>
    </div>

    <div v-if="codeArea" class="terminal-zone">
      <div class="terminal-bar">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        <span class="bar-title">mcu_register_output.h</span>
      </div>
      <textarea readonly v-model="codeArea"></textarea>
    </div>
  </div>
</template>

<style scoped>
.view-body { display: flex; flex-direction: column; gap: 20px; }
.view-header h3 { margin: 0; font-size: 20px; color: #4a4e69; font-weight: 800; }
.io-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.io-card { background: #ffffff; border: 3px solid #f1f5f9; border-radius: 20px; padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
.io-card.focus { border-color: #cbd5e1; background: #f8fafc; }
.io-icon { font-size: 44px; margin-bottom: 8px; }
.io-card h4 { margin: 4px 0; font-size: 16px; color: #1e293b; font-weight: bold; }
.io-card p { font-size: 12px; color: #64748b; line-height: 1.5; margin: 8px 0 16px 0; }
.btn-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.btn-action { width: 100%; border: none; padding: 11px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 13px; text-align: center; box-sizing: border-box; display: inline-block; transition: transform 0.1s; }
.btn-action:hover { transform: scale(1.02); }
.btn-action.primary { background: #ff758f; color: white; }
.btn-action.secondary { background: #f1f5f9; color: #475569; }
.btn-action.success { background: #2a9d8f; color: white; }
.terminal-zone { background: #1e1e24; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; margin-top: 10px; }
.terminal-bar { background: #2f2f38; padding: 8px 12px; display: flex; align-items: center; gap: 6px; position: relative;}
.terminal-bar .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.red { background: #ef4444; } .dot.yellow { background: #f59e0b; } .dot.green { background: #10b981; }
.bar-title { color: #94a3b8; font-size: 11px; font-family: monospace; position: absolute; left: 50%; transform: translateX(-50%); }
.terminal-zone textarea { width: 100%; height: 180px; background: transparent; color: #a7c957; border: none; padding: 14px; box-sizing: border-box; resize: none; outline: none; font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.6; }
</style>
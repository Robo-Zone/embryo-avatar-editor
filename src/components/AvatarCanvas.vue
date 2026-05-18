<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Application, Sprite, Assets } from 'pixi.js' // 🌟 引入 v8 异步资产加载器
import { AvatarPart, ARCHETYPES } from '../store/avatar'

const props = defineProps<{ 
  parts: AvatarPart[],
  archetypeId: 'humanoid' | 'canine'
}>()

const canvasContainer = ref<HTMLDivElement | null>(null)
let app: Application | null = null

// 硬件级精灵缓存池，防止重复创建导致内存抖动
const spriteCache = new Map<string, Sprite & { currentUrl?: string }>()
let tick = 0

// 1. 动效算子核心
const getAnimProps = (slotKey: string) => {
  const slotsConfig = ARCHETYPES[props.archetypeId]?.slots
  const slot = slotsConfig?.find(s => s.key === slotKey)
  const animProps = { x: 0, y: 0, rotation: 0, scaleY: 1 }
  if (!slot) return animProps

  const t = tick * slot.animSpeed

  if (slot.animType === 'bob') {
    animProps.y = Math.sin(t) * slot.animRange
  } else if (slot.animType === 'swing') {
    animProps.rotation = Math.sin(t) * slot.animRange
  } else if (slot.animType === 'blink') {
    const pulse = Math.sin(t)
    animProps.scaleY = pulse > 0.94 ? 0.1 : 1 // 周期性眨眼
  }
  return animProps
}

// 2. 核心异步渲染管道：精准对齐 GPU 显存
const renderAndAnimate = () => {
  if (!app) return

  // 清理机制：如果零件在仓库或编辑时被用户卸载，立刻从渲染舞台中抹去
  const activeIds = new Set(props.parts.map(p => p.id))
  for (const [id, sprite] of spriteCache.entries()) {
    if (!activeIds.has(id)) {
      app.stage.removeChild(sprite)
      sprite.destroy()
      spriteCache.delete(id)
    }
  }

  // 渲染与动态属性映射
  props.parts.forEach(async (part) => {
    let sprite = spriteCache.get(part.id)
    
    if (!sprite) {
      sprite = new Sprite()
      sprite.anchor.set(0.5) // 强制轴心对齐物理中心
      app.stage.addChild(sprite)
      spriteCache.set(part.id, sprite)
    }

    // 🌟 核心修正：检测到路径变更时，使用 v8 标准的 Assets.load 异步加载静态 SVG
    if (sprite.currentUrl !== part.textureUrl) {
      sprite.currentUrl = part.textureUrl
      try {
        const texture = await Assets.load(part.textureUrl)
        // 校验防止异步回调时用户已经切换了其它组件
        if (sprite.currentUrl === part.textureUrl) {
          sprite.texture = texture
        }
      } catch (e) {
        console.error('资产装载中断，请检查 public/parts/ 路径: ', part.textureUrl, e)
      }
    }

    // 毫秒级应用控制面板的滑块参数与缓动动画
    const offsets = getAnimProps(part.slotKey)
    sprite.x = part.x
    sprite.y = part.y + offsets.y
    sprite.rotation = offsets.rotation
    sprite.scale.x = part.scale
    sprite.scale.y = part.scale * offsets.scaleY
    
    // 🌟 核心修正：绑定图层高度。即使图片下载有先后，排序也绝不会乱
    sprite.zIndex = part.zIndex
  })
}

// 3. 驱动引擎挂载
onMounted(async () => {
  if (!canvasContainer.value) return

  try {
    app = new Application()
    await app.init({
      width: 300,
      height: 300,
      background: '#f8fafc',
      hello: false
    })

    // 开启高精度动态图层排序支持
    app.stage.sortableChildren = true
    canvasContainer.value.appendChild(app.canvas)

    // 载入主渲染线程
    app.ticker.add((ticker) => {
      tick += ticker.deltaTime
      renderAndAnimate()
    })
  } catch (error) {
    console.error('PixiJS Engine Crash:', error)
  }
})

onUnmounted(() => {
  if (app) {
    app.destroy(true, { children: true })
    spriteCache.clear()
  }
})
</script>

<template>
  <div ref="canvasContainer" class="canvas-wrapper"></div>
</template>

<style scoped>
.canvas-wrapper {
  width: 300px;
  height: 300px;
  border: 4px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  display: inline-block;
  box-sizing: border-box;
  background-color: #f8fafc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}
:deep(canvas) { display: block; width: 100%; height: 100%; }
</style>
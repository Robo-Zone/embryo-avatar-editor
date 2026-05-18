import { ref, computed } from 'vue'

export type AnimType = 'bob' | 'swing' | 'blink' | 'none';

export interface SlotConfig {
  key: string;
  name: string;
  defaultZIndex: number;
  animType: AnimType;
  animSpeed: number;
  animRange: number;
}

export interface Archetype {
  id: 'humanoid' | 'canine';
  name: string;
  slots: SlotConfig[];
}

export interface AvatarPart {
  id: string;
  slotKey: string;
  name: string;
  textureUrl: string;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface AvatarItem {
  id: string;
  name: string;
  archetypeId: 'humanoid' | 'canine';
  description: string;
  parts: AvatarPart[];
}

// 1. 无 If-Else 架构：动态插槽层级映射表
export const ARCHETYPES: Record<string, Archetype> = {
  humanoid: {
    id: 'humanoid',
    name: '人形态 (Humanoid)',
    slots: [
      { key: 'legs',  name: '开口小双腿', defaultZIndex: 1, animType: 'none',  animSpeed: 0,    animRange: 0 },
      { key: 'body',  name: '粉嫩卫衣裙', defaultZIndex: 2, animType: 'bob',   animSpeed: 0.04, animRange: 3 },
      { key: 'arms',  name: '卫衣同色袖', defaultZIndex: 3, animType: 'swing', animSpeed: 0.04, animRange: 0.04 },
      { key: 'face',  name: '红润Q弹脸',  defaultZIndex: 4, animType: 'bob',   animSpeed: 0.04, animRange: 3 },
      { key: 'mouth', name: '猫咪元气笑', defaultZIndex: 5, animType: 'bob',   animSpeed: 0.04, animRange: 3 },
      { key: 'eyes',  name: '动漫大眼睛', defaultZIndex: 6, animType: 'blink', animSpeed: 0.02, animRange: 1 },
      { key: 'hair',  name: '高马尾紫发', defaultZIndex: 7, animType: 'swing', animSpeed: 0.03, animRange: 0.05 },
    ]
  },
  canine: {
    id: 'canine',
    name: '犬形态 (Canine)',
    slots: [
      { key: 'body',  name: '🐕 柴犬身体', defaultZIndex: 1, animType: 'bob',   animSpeed: 0.06, animRange: 3 },
      { key: 'head',  name: '🐶 柴犬大头', defaultZIndex: 2, animType: 'bob',   animSpeed: 0.06, animRange: 3 },
      { key: 'mouth', name: '👅 贪吃小嘴', defaultZIndex: 3, animType: 'bob',   animSpeed: 0.06, animRange: 3 },
      { key: 'eyes',  name: '⚫ 纯真黑眼', defaultZIndex: 4, animType: 'none',  animSpeed: 0,    animRange: 0 },
      { key: 'ears',  name: '👂 飞机耳朵', defaultZIndex: 5, animType: 'swing', animSpeed: 0.05, animRange: 0.12 },
    ]
  }
}

// 2. 本地解耦静态素材库注册
export const ASSET_LIBRARY = [
  // 人形组件清单
  { id: 'h_legs',  archetypeId: 'humanoid', slotKey: 'legs',  name: 'Q弹小双腿',  url: '/parts/human_legs.svg' },
  { id: 'h_body',  archetypeId: 'humanoid', slotKey: 'body',  name: '粉嫩卫衣裙',  url: '/parts/human_body_hoodie.svg' },
  { id: 'h_arms',  archetypeId: 'humanoid', slotKey: 'arms',  name: '卫衣同色袖',  url: '/parts/human_arms.svg' },
  { id: 'h_face',  archetypeId: 'humanoid', slotKey: 'face',  name: '红润Q弹脸',   url: '/parts/human_face_blank.svg' },
  { id: 'h_mouth', archetypeId: 'humanoid', slotKey: 'mouth', name: '猫咪元气笑',  url: '/parts/human_mouth_cat.svg' },
  { id: 'h_eyes',  archetypeId: 'humanoid', slotKey: 'eyes',  name: '动漫大眼睛',  url: '/parts/human_eyes_anime.svg' },
  { id: 'h_hair',  archetypeId: 'humanoid', slotKey: 'hair',  name: '高马尾紫发',  url: '/parts/human_hair_purple.svg' },

  // 犬形组件清单（完美对齐本地现有的静态 SVG 路径）
  { id: 'c_body',  archetypeId: 'canine',   slotKey: 'body',  name: '胖嘟嘟狗身',  url: '/parts/canine_body_chubby.svg' },
  { id: 'c_head',  archetypeId: 'canine',   slotKey: 'head',  name: '柴犬大福头',  url: '/parts/canine_head_shiba.svg' },
  { id: 'c_mouth', archetypeId: 'canine',   slotKey: 'mouth', name: '贪吃小舌头',  url: '/parts/canine_mouth_tongue.svg' },
  { id: 'c_eyes',  archetypeId: 'canine',   slotKey: 'eyes',  name: '纯真黑豆眼',  url: '/parts/canine_eyes_dots.svg' },
  { id: 'c_ears',  archetypeId: 'canine',   slotKey: 'ears',  name: '大飞机耳朵',  url: '/parts/canine_ears_pointy.svg' }
]

const currentTab = ref<'manage' | 'edit' | 'io'>('manage')

// 3. 核心修正：补齐重启后消失的电子机器狗默认挂件列表，实现双模并存
const avatarList = ref<AvatarItem[]>([
  {
    id: 'avatar_human_default',
    name: '初代赛博人类',
    archetypeId: 'humanoid',
    description: '已修复肢体骨骼与眨眼Bug的完成体实例',
    parts: [
      { id: 'hp1', slotKey: 'legs',  name: 'Q弹小双腿', textureUrl: '/parts/human_legs.svg',        x: 150, y: 150, scale: 2.0, zIndex: 1 },
      { id: 'hp2', slotKey: 'body',  name: '粉嫩卫衣裙', textureUrl: '/parts/human_body_hoodie.svg', x: 150, y: 150, scale: 2.0, zIndex: 2 },
      { id: 'hp3', slotKey: 'arms',  name: '卫衣同色袖', textureUrl: '/parts/human_arms.svg',        x: 150, y: 150, scale: 2.0, zIndex: 3 },
      { id: 'hp4', slotKey: 'face',  name: '红润Q弹脸',  textureUrl: '/parts/human_face_blank.svg',  x: 150, y: 150, scale: 2.0, zIndex: 4 },
      { id: 'hp5', slotKey: 'mouth', name: '猫咪元气笑', textureUrl: '/parts/human_mouth_cat.svg',   x: 150, y: 150, scale: 2.0, zIndex: 5 },
      { id: 'hp6', slotKey: 'eyes',  name: '动漫大眼睛', textureUrl: '/parts/human_eyes_anime.svg',   x: 150, y: 150, scale: 2.0, zIndex: 6 },
      { id: 'hp7', slotKey: 'hair',  name: '高马尾紫发', textureUrl: '/parts/human_hair_purple.svg',   x: 150, y: 150, scale: 2.0, zIndex: 7 }
    ]
  },
  {
    id: 'avatar_canine_default',
    name: '赛博机器小狗',
    archetypeId: 'canine',
    description: '高度动态四足协同底盘实例',
    parts: [
      { id: 'cp1', slotKey: 'body',  name: '胖嘟嘟狗身', textureUrl: '/parts/canine_body_chubby.svg',  x: 150, y: 150, scale: 2.0, zIndex: 1 },
      { id: 'cp2', slotKey: 'head',  name: '柴犬大福头', textureUrl: '/parts/canine_head_shiba.svg',   x: 150, y: 150, scale: 2.0, zIndex: 2 },
      { id: 'cp3', slotKey: 'mouth', name: '贪吃小舌头', textureUrl: '/parts/canine_mouth_tongue.svg',  x: 150, y: 150, scale: 2.0, zIndex: 3 },
      { id: 'cp4', slotKey: 'eyes',  name: '纯真黑豆眼', textureUrl: '/parts/canine_eyes_dots.svg',    x: 150, y: 150, scale: 2.0, zIndex: 4 },
      { id: 'cp5', slotKey: 'ears',  name: '大飞机耳朵', textureUrl: '/parts/canine_ears_pointy.svg',   x: 150, y: 150, scale: 2.0, zIndex: 5 }
    ]
  }
])

const activeAvatarId = ref<string>('avatar_human_default')
const selectedPartId = ref<string | null>('hp2')

export const useAvatarStore = () => {
  const currentAvatar = computed(() => {
    return avatarList.value.find(a => a.id === activeAvatarId.value) || avatarList.value[0] || null
  })

  const currentArchetypeConfig = computed(() => {
    if (!currentAvatar.value) return null
    return ARCHETYPES[currentAvatar.value.archetypeId]
  })

  const setActiveAvatar = (id: string) => {
    activeAvatarId.value = id
    if (currentAvatar.value && currentAvatar.value.parts.length > 0) {
      selectedPartId.value = currentAvatar.value.parts[0].id
    }
  }

  const createNewAvatarWithTemplate = (archId: 'humanoid' | 'canine') => {
    const newId = 'avatar_' + Date.now()
    const config = ARCHETYPES[archId]
    avatarList.value.unshift({
      id: newId,
      name: `自定义 ${config.name.split(' ')[0]}_${Math.floor(Math.random()*100)}`,
      archetypeId: archId,
      description: '等待拼装零件...',
      parts: []
    })
    setActiveAvatar(newId)
    currentTab.value = 'edit'
  }

  const deleteAvatar = (id: string) => {
    if (avatarList.value.length <= 1) return alert('请保留至少一个核心运行实例')
    avatarList.value = avatarList.value.filter(a => a.id !== id)
    if (activeAvatarId.value === id) setActiveAvatar(avatarList.value[0].id)
  }

  const addPartToCurrent = (asset: typeof ASSET_LIBRARY[0]) => {
    if (!currentAvatar.value) return
    currentAvatar.value.parts = currentAvatar.value.parts.filter(p => p.slotKey !== asset.slotKey)
    const targetSlot = ARCHETYPES[currentAvatar.value.archetypeId].slots.find(s => s.key === asset.slotKey)

    const newPart: AvatarPart = {
      id: 'part_' + Date.now(),
      slotKey: asset.slotKey,
      name: asset.name,
      textureUrl: asset.url,
      x: 150,
      y: 150,
      scale: 2.0, 
      zIndex: targetSlot ? targetSlot.defaultZIndex : 1
    }
    currentAvatar.value.parts.push(newPart)
    selectedPartId.value = newPart.id
  }

  const removePartFromCurrent = (partId: string) => {
    if (!currentAvatar.value) return
    currentAvatar.value.parts = currentAvatar.value.parts.filter(p => p.id !== partId)
    selectedPartId.value = currentAvatar.value.parts[0]?.id || null
  }

  return {
    currentTab, avatarList, activeAvatarId, selectedPartId, currentAvatar, currentArchetypeConfig,
    setActiveAvatar, createNewAvatarWithTemplate, deleteAvatar, addPartToCurrent, removePartFromCurrent
  }
}
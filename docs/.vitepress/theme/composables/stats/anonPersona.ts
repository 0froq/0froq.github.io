/**
 * Deterministic anonymous visitor persona from anonId.
 * Same browser → same color + animal emoji + trait forever.
 */

export interface AnonPersona {
  colorHex: string
  colorName: { zh: string, en: string }
  animal: { zh: string, en: string, emoji: string }
  trait: { zh: string, en: string }
  emoji: string
  /** Short display name, e.g. 「靛蓝水獭」 / "Indigo Otter" */
  label: (locale: string) => string
  /** Longer, e.g. 「沉静的靛蓝水獭」 / "quiet Indigo Otter" */
  fullLabel: (locale: string) => string
}

/** Soft but clearer chroma — paper-friendly, less muddy gray. */
const COLORS: { hex: string, zh: string, en: string }[] = [
  { hex: '#3B6EA8', zh: '靛蓝', en: 'Indigo' },
  { hex: '#5F8A4A', zh: '苔绿', en: 'Moss' },
  { hex: '#C4843A', zh: '赭石', en: 'Ochre' },
  { hex: '#A85C5C', zh: '绛褐', en: 'Umber' },
  { hex: '#4A7A8C', zh: '青灰', en: 'Slate' },
  { hex: '#A07848', zh: '茶褐', en: 'Tea' },
  { hex: '#2F7A86', zh: '黛青', en: 'Teal' },
  { hex: '#B08968', zh: '亚麻', en: 'Linen' },
  { hex: '#8B5A7A', zh: '葡萄', en: 'Grape' },
  { hex: '#4A8A5C', zh: '苍绿', en: 'Sage' },
  { hex: '#9A6B45', zh: '檀木', en: 'Sandal' },
  { hex: '#4A7AB0', zh: '雾蓝', en: 'Mist' },
]

const ANIMALS: { zh: string, en: string, emoji: string }[] = [
  // { zh: '水獭', en: 'Otter', emoji: '🦦' },
  // { zh: '狐狸', en: 'Fox', emoji: '🦊' },
  // { zh: '麋鹿', en: 'Elk', emoji: '🦌' },
  // { zh: '乌鸦', en: 'Crow', emoji: '🐦‍⬛' },
  { zh: '小蜗', en: 'Gary the Snail', emoji: '🐌' },
  // { zh: '鲤鱼', en: 'Carp', emoji: '🐟' },
  { zh: '猫儿', en: 'Kitty', emoji: '🐱' },
  // { zh: '猫头鹰', en: 'Owl', emoji: '🦉' },
  // { zh: '刺猬', en: 'Hedgehog', emoji: '🦔' },
  { zh: '兔兔', en: 'Bunny', emoji: '🐰' },
  // { zh: '燕', en: 'Swallow', emoji: '🕊️' },
  // { zh: '貉', en: 'Tanuki', emoji: '🦝' },
  // { zh: '蝉', en: 'Cicada', emoji: '🦗' },
  // { zh: '鹿', en: 'Deer', emoji: '🦌' },
  // { zh: '鹤', en: 'Crane', emoji: '🦢' },
  { zh: '青蛙', en: 'Frog', emoji: '🐸' },
  { zh: '小恶魔', en: 'Devil', emoji: '😈' },
  { zh: '小丑', en: 'Clown', emoji: '🤡' },
  { zh: '便便', en: 'Poop', emoji: '💩' },
  { zh: '毛线球', en: 'Yarn', emoji: '🧶' },
  { zh: '耗子', en: 'Rat', emoji: '🐭' },
  { zh: '仓耗子', en: 'Hamster', emoji: '🐹' },
  { zh: '狗儿', en: 'Doggo', emoji: '🐶' },
  { zh: '熊熊', en: 'Bear', emoji: '🐻' },
  { zh: '盼达', en: 'Panda', emoji: '🐼' },
  { zh: '闪电', en: 'Flash', emoji: '🐨' },
  { zh: '猪儿', en: 'Piggy', emoji: '🐷' },
  { zh: '企鹅', en: 'Penguin', emoji: '🐧' },
  { zh: '猪儿虫', en: 'Bug', emoji: '🐛' },
  { zh: '失败的', en: 'Spider', emoji: '🕷️' },
  { zh: '地球', en: 'Earth', emoji: '🌍' },
  { zh: '雪人', en: 'Snowman', emoji: '⛄️' },
  { zh: '火爆辣椒', en: 'Jalapeno', emoji: '🌶️' },
  { zh: '不火爆辣椒', en: 'Bell Pepper', emoji: '🫑' },
  { zh: '他妈的', en: 'Tomato', emoji: '🍅' },
]

const TRAITS: { zh: string, en: string }[] = [
  { zh: '沉静', en: 'quiet' },
  { zh: '执拗', en: 'stubborn' },
  { zh: '疏懒', en: 'idle' },
  { zh: '敏锐', en: 'keen' },
  { zh: '温吞', en: 'mild' },
  { zh: '好奇', en: 'curious' },
  { zh: '寡言', en: 'taciturn' },
  { zh: '徘徊', en: 'wandering' },
  { zh: '清醒', en: 'lucid' },
  { zh: '迟疑', en: 'hesitant' },
  { zh: '专注', en: 'focused' },
  { zh: '轻盈', en: 'light' },
]

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick<T>(list: T[], h: number, salt: number): T {
  return list[(h + salt * 2654435761) % list.length]!
}

/** Build a stable persona from anonId (or any stable seed). */
export function personaFromAnonId(anonId: string): AnonPersona {
  const h = hashString(anonId || 'anon')
  const color = pick(COLORS, h, 1)
  const animal = pick(ANIMALS, h, 2)
  const trait = pick(TRAITS, h, 3)

  return {
    colorHex: color.hex,
    colorName: { zh: color.zh, en: color.en },
    animal: { zh: animal.zh, en: animal.en, emoji: animal.emoji },
    trait: { zh: trait.zh, en: trait.en },
    emoji: animal.emoji,
    label: (locale: string) => {
      if (locale === 'zh')
        return `${color.zh}${animal.zh}`
      return `${color.en} ${animal.en}`
    },
    fullLabel: (locale: string) => {
      if (locale === 'zh')
        return `${trait.zh}的${color.zh}${animal.zh}`
      return `${trait.en} ${color.en} ${animal.en}`
    },
  }
}

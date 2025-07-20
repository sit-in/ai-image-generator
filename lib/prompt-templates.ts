export interface PromptTemplate {
  id: string;
  category: string;
  categoryEmoji: string;
  title: string;
  prompt: string;
  description: string;
  thumbnail?: string;
  tags: string[];
}

export const promptCategories = [
  { id: 'character', name: '人物角色', emoji: '👤' },
  { id: 'scenery', name: '风景场景', emoji: '🏞️' },
  { id: 'animal', name: '动物宠物', emoji: '🐾' },
  { id: 'fantasy', name: '奇幻幻想', emoji: '🦄' },
  { id: 'tech', name: '科技未来', emoji: '🚀' },
  { id: 'art', name: '艺术创意', emoji: '🎨' },
];

export const promptTemplates: PromptTemplate[] = [
  // 人物角色
  {
    id: '1',
    category: 'character',
    categoryEmoji: '👤',
    title: '优雅古风美人',
    prompt: '身穿汉服的古典美女，长发飘飘，手持团扇，站在梅花树下，月光洒在身上，唯美浪漫的氛围',
    description: '创造古典中国风格的人物形象',
    tags: ['古风', '人物', '唯美']
  },
  {
    id: '2',
    category: 'character',
    categoryEmoji: '👤',
    title: '赛博朋克战士',
    prompt: '未来战士，身穿高科技装甲，霓虹灯光反射在金属表面，雨夜的城市街道，赛博朋克风格',
    description: '设计未来科技感的角色',
    tags: ['科幻', '人物', '赛博朋克']
  },
  {
    id: '3',
    category: 'character',
    categoryEmoji: '👤',
    title: '魔法少女',
    prompt: '可爱的魔法少女，粉色双马尾，手持魔法杖，周围环绕着星星和彩虹，梦幻般的背景',
    description: '创作日系魔法少女形象',
    tags: ['动漫', '人物', '魔法']
  },

  // 风景场景
  {
    id: '4',
    category: 'scenery',
    categoryEmoji: '🏞️',
    title: '梦幻樱花大道',
    prompt: '春天的樱花大道，粉色花瓣飘落，阳光透过树枝洒下，地面铺满花瓣，浪漫唯美的氛围',
    description: '春日樱花美景',
    tags: ['风景', '樱花', '春天']
  },
  {
    id: '5',
    category: 'scenery',
    categoryEmoji: '🏞️',
    title: '极光雪山',
    prompt: '北极的雪山，绚烂的极光在夜空中舞动，星空璀璨，雪地反射着极光的色彩',
    description: '壮观的极地风光',
    tags: ['风景', '极光', '雪山']
  },
  {
    id: '6',
    category: 'scenery',
    categoryEmoji: '🏞️',
    title: '热带海滩日落',
    prompt: '热带海滩的日落时分，椰子树剪影，橙红色的天空倒映在海面上，细腻的沙滩',
    description: '温暖的海滩风光',
    tags: ['风景', '海滩', '日落']
  },

  // 动物宠物
  {
    id: '7',
    category: 'animal',
    categoryEmoji: '🐾',
    title: '萌宠柯基',
    prompt: '可爱的柯基犬，短腿圆屁股，在草地上奔跑，舌头伸出来，阳光下毛发闪闪发光',
    description: '活泼可爱的宠物狗',
    tags: ['动物', '宠物', '柯基']
  },
  {
    id: '8',
    category: 'animal',
    categoryEmoji: '🐾',
    title: '神秘黑猫',
    prompt: '优雅的黑猫，金色的眼睛，坐在月光下的屋顶上，背景是繁星点点的夜空',
    description: '高贵神秘的猫咪',
    tags: ['动物', '猫', '夜晚']
  },
  {
    id: '9',
    category: 'animal',
    categoryEmoji: '🐾',
    title: '森林精灵鹿',
    prompt: '梦幻的白鹿，鹿角上缠绕着发光的藤蔓，站在迷雾森林中，周围有萤火虫飞舞',
    description: '童话般的森林动物',
    tags: ['动物', '奇幻', '森林']
  },

  // 奇幻幻想
  {
    id: '10',
    category: 'fantasy',
    categoryEmoji: '🦄',
    title: '水晶龙',
    prompt: '巨大的水晶龙，透明的身体折射出七彩光芒，盘旋在云端，背景是梦幻的天空',
    description: '神话中的奇幻生物',
    tags: ['奇幻', '龙', '水晶']
  },
  {
    id: '11',
    category: 'fantasy',
    categoryEmoji: '🦄',
    title: '精灵树屋',
    prompt: '巨大古树上的精灵树屋，发光的窗户，连接各处的吊桥，夜晚萤火虫环绕',
    description: '童话世界的居所',
    tags: ['奇幻', '建筑', '精灵']
  },
  {
    id: '12',
    category: 'fantasy',
    categoryEmoji: '🦄',
    title: '魔法图书馆',
    prompt: '古老的魔法图书馆，漂浮的书本，发光的魔法阵，神秘的光球照明，无尽的书架',
    description: '充满魔法的知识殿堂',
    tags: ['奇幻', '魔法', '图书馆']
  },

  // 科技未来
  {
    id: '13',
    category: 'tech',
    categoryEmoji: '🚀',
    title: '未来都市',
    prompt: '2080年的未来城市，飞行汽车穿梭在摩天大楼间，全息广告投影，霓虹灯光璀璨',
    description: '高科技未来城市景观',
    tags: ['科技', '城市', '未来']
  },
  {
    id: '14',
    category: 'tech',
    categoryEmoji: '🚀',
    title: '太空站',
    prompt: '巨大的环形太空站，透过窗户可以看到地球，内部是未来科技风格的走廊',
    description: '宇宙中的人类家园',
    tags: ['科技', '太空', '宇宙']
  },
  {
    id: '15',
    category: 'tech',
    categoryEmoji: '🚀',
    title: 'AI机器人',
    prompt: '友善的家用AI机器人，流线型设计，白色和蓝色配色，LED表情显示屏，现代家居环境',
    description: '未来的智能伙伴',
    tags: ['科技', '机器人', 'AI']
  },

  // 艺术创意
  {
    id: '16',
    category: 'art',
    categoryEmoji: '🎨',
    title: '梵高星空风',
    prompt: '梵高风格的星空，漩涡状的云彩，明亮的星星，下面是宁静的小镇，油画质感',
    description: '致敬大师的艺术风格',
    tags: ['艺术', '梵高', '油画']
  },
  {
    id: '17',
    category: 'art',
    categoryEmoji: '🎨',
    title: '抽象色彩爆炸',
    prompt: '抽象艺术风格，鲜艳的色彩爆炸，流动的形状，强烈的对比，充满活力和能量',
    description: '现代抽象艺术创作',
    tags: ['艺术', '抽象', '色彩']
  },
  {
    id: '18',
    category: 'art',
    categoryEmoji: '🎨',
    title: '中国水墨山水',
    prompt: '传统中国水墨画风格，远山如黛，云雾缭绕，近处有亭台楼阁，意境深远',
    description: '东方传统艺术美学',
    tags: ['艺术', '水墨', '中国风']
  }
];

// 根据类别获取模板
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return promptTemplates.filter(template => template.category === category);
}

// 根据标签搜索模板
export function searchTemplatesByTags(tags: string[]): PromptTemplate[] {
  return promptTemplates.filter(template => 
    tags.some(tag => template.tags.includes(tag))
  );
}

// 获取随机模板
export function getRandomTemplates(count: number): PromptTemplate[] {
  const shuffled = [...promptTemplates].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
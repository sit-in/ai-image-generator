// 提示词优化服务
export class PromptOptimizer {
  // 常用中文到英文的映射
  private static commonTranslations: Record<string, string> = {
    // 人物
    '美女': 'beautiful woman',
    '帅哥': 'handsome man',
    '女孩': 'girl',
    '男孩': 'boy',
    '小孩': 'child',
    '婴儿': 'baby',
    '老人': 'elderly person',
    
    // 动物
    '猫': 'cat',
    '小猫': 'kitten',
    '狗': 'dog',
    '小狗': 'puppy',
    '兔子': 'rabbit',
    '熊猫': 'panda',
    '狮子': 'lion',
    '老虎': 'tiger',
    '大象': 'elephant',
    '鸟': 'bird',
    '蝴蝶': 'butterfly',
    
    // 颜色
    '红色': 'red',
    '蓝色': 'blue',
    '绿色': 'green',
    '黄色': 'yellow',
    '紫色': 'purple',
    '粉色': 'pink',
    '黑色': 'black',
    '白色': 'white',
    '金色': 'golden',
    '银色': 'silver',
    '彩虹': 'rainbow',
    
    // 场景
    '森林': 'forest',
    '海洋': 'ocean',
    '天空': 'sky',
    '草地': 'grassland',
    '花园': 'garden',
    '城市': 'city',
    '山': 'mountain',
    '河流': 'river',
    '沙漠': 'desert',
    '雪山': 'snowy mountain',
    
    // 物品
    '花': 'flower',
    '玫瑰': 'rose',
    '树': 'tree',
    '房子': 'house',
    '城堡': 'castle',
    '汽车': 'car',
    '飞机': 'airplane',
    '船': 'ship',
    '书': 'book',
    '星星': 'stars',
    '月亮': 'moon',
    '太阳': 'sun',
    
    // 动作
    '跑': 'running',
    '走': 'walking',
    '坐': 'sitting',
    '站': 'standing',
    '飞': 'flying',
    '游泳': 'swimming',
    '跳舞': 'dancing',
    '唱歌': 'singing',
    '吃': 'eating',
    '喝': 'drinking',
    '玩': 'playing',
    '睡觉': 'sleeping',
    
    // 形容词
    '可爱': 'cute',
    '美丽': 'beautiful',
    '漂亮': 'pretty',
    '帅气': 'handsome',
    '快乐': 'happy',
    '悲伤': 'sad',
    '大': 'big',
    '小': 'small',
    '高': 'tall',
    '矮': 'short',
    '胖': 'fat',
    '瘦': 'thin',
    
    // 风格相关
    '卡通': 'cartoon',
    '写实': 'realistic',
    '梦幻': 'dreamy',
    '科幻': 'sci-fi',
    '古代': 'ancient',
    '现代': 'modern',
    '未来': 'futuristic',
    
    // 常见组合
    '一只': 'a',
    '一个': 'a',
    '很多': 'many',
    '几个': 'several',
    '在': 'in/at/on',
    '的': "'s/of",
    '和': 'and',
    '或': 'or',
    '穿着': 'wearing',
    '拿着': 'holding',
    '带着': 'with',
  };

  // 风格增强词
  private static styleEnhancements: Record<string, string[]> = {
    'natural': ['photorealistic', '8k resolution', 'highly detailed', 'professional photography'],
    'anime': ['anime style', 'manga art', 'japanese animation', 'cel shaded'],
    'oil': ['oil painting', 'thick brushstrokes', 'artistic', 'classical painting style'],
    'watercolor': ['watercolor painting', 'soft colors', 'artistic blur', 'wet on wet technique'],
    'pixel': ['pixel art', '8-bit style', 'retro gaming', 'pixelated'],
    'ghibli': ['studio ghibli style', 'miyazaki', 'anime movie', 'hand-drawn animation']
  };

  // 质量增强词
  private static qualityTerms = [
    'masterpiece',
    'best quality',
    'highly detailed',
    'ultra-detailed',
    'professional',
    'award winning'
  ];

  // 负面提示词（避免的内容）
  private static negativePrompts = [
    'low quality',
    'blurry',
    'distorted',
    'disfigured',
    'bad anatomy',
    'watermark',
    'text',
    'logo'
  ];

  /**
   * 优化提示词
   */
  static optimize(prompt: string, style: string = 'natural'): {
    optimizedPrompt: string;
    translatedPrompt: string;
    suggestions: string[];
  } {
    // 1. 基础清理
    let cleanedPrompt = prompt.trim().toLowerCase();
    
    // 2. 检测是否包含中文
    const containsChinese = /[\u4e00-\u9fff]/.test(cleanedPrompt);
    
    // 3. 翻译或增强
    let translatedPrompt = cleanedPrompt;
    if (containsChinese) {
      translatedPrompt = this.translateChineseTerms(cleanedPrompt);
    }

    // 4. 添加风格特定的增强词
    const styleTerms = this.styleEnhancements[style] || this.styleEnhancements['natural'];
    
    // 5. 构建最终的优化提示词
    const optimizedParts = [
      ...this.extractMainSubject(translatedPrompt),
      ...styleTerms.slice(0, 2),
      translatedPrompt,
      ...this.qualityTerms.slice(0, 2)
    ];

    const optimizedPrompt = optimizedParts.filter(Boolean).join(', ');

    // 6. 生成建议
    const suggestions = this.generateSuggestions(prompt, style);

    return {
      optimizedPrompt,
      translatedPrompt,
      suggestions
    };
  }

  /**
   * 翻译中文词汇
   */
  private static translateChineseTerms(prompt: string): string {
    let translated = prompt;
    
    // 按照词汇长度从长到短排序，避免短词覆盖长词
    const sortedTerms = Object.entries(this.commonTranslations)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [chinese, english] of sortedTerms) {
      const regex = new RegExp(chinese, 'g');
      translated = translated.replace(regex, ` ${english} `);
    }
    
    // 清理多余空格
    translated = translated.replace(/\s+/g, ' ').trim();
    
    // 如果还有中文字符，添加提示
    if (/[\u4e00-\u9fff]/.test(translated)) {
      translated = `(Chinese: ${prompt}) ${translated}`;
    }
    
    return translated;
  }

  /**
   * 提取主要主题
   */
  private static extractMainSubject(prompt: string): string[] {
    const subjects = [];
    
    // 检测常见主题
    if (prompt.includes('woman') || prompt.includes('girl')) {
      subjects.push('portrait');
    }
    if (prompt.includes('landscape') || prompt.includes('mountain') || prompt.includes('forest')) {
      subjects.push('landscape photography');
    }
    if (prompt.includes('cat') || prompt.includes('dog') || prompt.includes('animal')) {
      subjects.push('animal photography');
    }
    
    return subjects;
  }

  /**
   * 生成优化建议
   */
  private static generateSuggestions(originalPrompt: string, style: string): string[] {
    const suggestions = [];
    
    // 检查是否有中文
    if (/[\u4e00-\u9fff]/.test(originalPrompt)) {
      suggestions.push('💡 建议使用英文描述以获得更好的效果');
      suggestions.push('📝 AI已自动翻译您的中文描述');
    }
    
    // 根据风格给出建议
    const styleSpecificTips: Record<string, string[]> = {
      'anime': [
        '可以添加"kawaii"让角色更可爱',
        '试试添加"big eyes"获得典型动漫风格'
      ],
      'oil': [
        '可以指定画家风格如"in the style of Van Gogh"',
        '添加"impasto"获得厚涂效果'
      ],
      'watercolor': [
        '添加"soft lighting"获得柔和效果',
        '可以指定"pastel colors"获得淡雅色彩'
      ],
      'ghibli': [
        '添加"peaceful"或"serene"获得吉卜力的宁静感',
        '可以加入"japanese countryside"等场景描述'
      ]
    };
    
    const styleTips = styleSpecificTips[style] || [];
    suggestions.push(...styleTips);
    
    // 通用建议
    if (originalPrompt.length < 10) {
      suggestions.push('📏 描述越详细，生成效果越好');
    }
    
    return suggestions;
  }

  /**
   * 获取负面提示词
   */
  static getNegativePrompt(): string {
    return this.negativePrompts.join(', ');
  }
}
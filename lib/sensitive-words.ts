// 敏感词库管理
export class SensitiveWordsFilter {
  private static instance: SensitiveWordsFilter;
  private words: Set<string>;
  private patterns: RegExp[];
  
  private constructor() {
    this.words = new Set();
    this.patterns = [];
    this.loadWords();
  }
  
  static getInstance(): SensitiveWordsFilter {
    if (!this.instance) {
      this.instance = new SensitiveWordsFilter();
    }
    return this.instance;
  }
  
  private loadWords() {
    // 基础敏感词列表（可从外部文件或数据库加载）
    const basicWords = [
      // 暴力相关
      'violence', 'violent', 'kill', 'murder', 'death', 'dead', 'die',
      'blood', 'bloody', 'gore', 'torture', 'harm', 'hurt', 'weapon',
      '暴力', '杀', '死', '血腥', '武器', '伤害',
      
      // 色情相关
      'nude', 'naked', 'nsfw', 'porn', 'sex', 'sexy', 'erotic',
      'explicit', 'adult', 'xxx', 'breast', 'genital',
      '裸', '色情', '性', '胸', '生殖',
      
      // 政治敏感
      'politic', 'government', 'protest', 'revolution',
      '政治', '政府', '抗议', '革命',
      
      // 歧视相关
      'racist', 'racism', 'discriminate', 'hate',
      '种族', '歧视', '仇恨',
      
      // 非法内容
      'drug', 'cocaine', 'heroin', 'meth',
      '毒品', '大麻', '冰毒',
      
      // 其他不当内容
      'suicide', 'self-harm', 'terrorist', 'terrorism',
      '自杀', '自残', '恐怖'
    ];
    
    // 添加基础词汇
    basicWords.forEach(word => this.words.add(word.toLowerCase()));
    
    // 添加正则模式（用于匹配变体）
    this.patterns = [
      // 匹配用空格、符号分隔的敏感词
      /k[\s\-_\.]*i[\s\-_\.]*l[\s\-_\.]*l/i,
      /s[\s\-_\.]*e[\s\-_\.]*x/i,
      /p[\s\-_\.]*o[\s\-_\.]*r[\s\-_\.]*n/i,
      /n[\s\-_\.]*s[\s\-_\.]*f[\s\-_\.]*w/i,
      
      // 数字替代字母
      /p0rn/i, /s3x/i, /n4ked/i,
      
      // 重复字符
      /ki+ll+/i, /se+x+y*/i, /po+rn+/i
    ];
  }
  
  // 检查文本是否包含敏感词
  check(text: string): { 
    isSensitive: boolean; 
    matchedWords: string[]; 
    suggestions?: string[] 
  } {
    if (!text) return { isSensitive: false, matchedWords: [] };
    
    const lowerText = text.toLowerCase();
    const matchedWords: string[] = [];
    
    // 检查直接匹配
    for (const word of this.words) {
      if (lowerText.includes(word)) {
        matchedWords.push(word);
      }
    }
    
    // 检查正则匹配
    for (const pattern of this.patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        matchedWords.push(match[0]);
      }
    }
    
    // 检查拼音或同音词
    const pinyinVariants = this.checkPinyinVariants(text);
    matchedWords.push(...pinyinVariants);
    
    // 去重
    const uniqueMatches = [...new Set(matchedWords)];
    
    return {
      isSensitive: uniqueMatches.length > 0,
      matchedWords: uniqueMatches,
      suggestions: uniqueMatches.length > 0 ? this.getSuggestions(text, uniqueMatches) : undefined
    };
  }
  
  // 检查拼音变体
  private checkPinyinVariants(text: string): string[] {
    const matches: string[] = [];
    const pinyinMap: Record<string, string[]> = {
      '政治': ['zhengzhi', 'zz'],
      '色情': ['seqing', 'sq'],
      '暴力': ['baoli', 'bl']
    };
    
    const lowerText = text.toLowerCase();
    for (const [chinese, pinyins] of Object.entries(pinyinMap)) {
      for (const pinyin of pinyins) {
        if (lowerText.includes(pinyin)) {
          matches.push(chinese);
        }
      }
    }
    
    return matches;
  }
  
  // 获取替代建议
  private getSuggestions(text: string, matchedWords: string[]): string[] {
    const suggestions: string[] = [];
    
    // 基于匹配的敏感词提供建议
    if (matchedWords.some(w => ['kill', 'death', 'die', '杀', '死'].includes(w))) {
      suggestions.push('请使用更温和的表达，如"消失"、"离开"等');
    }
    
    if (matchedWords.some(w => ['sexy', 'nude', 'naked', '性感', '裸'].includes(w))) {
      suggestions.push('请描述服装或造型，避免使用暴露相关词汇');
    }
    
    if (matchedWords.some(w => ['violence', 'violent', 'blood', '暴力', '血腥'].includes(w))) {
      suggestions.push('请创作和平、友好的内容');
    }
    
    // 通用建议
    suggestions.push('尝试使用更积极、正面的描述词');
    
    return suggestions;
  }
  
  // 清理文本（移除敏感词）
  clean(text: string): string {
    let cleanedText = text;
    
    // 替换直接匹配的词
    for (const word of this.words) {
      const regex = new RegExp(word, 'gi');
      cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
    }
    
    // 替换正则匹配的词
    for (const pattern of this.patterns) {
      cleanedText = cleanedText.replace(pattern, (match) => '*'.repeat(match.length));
    }
    
    return cleanedText;
  }
  
  // 添加自定义敏感词
  addWord(word: string) {
    this.words.add(word.toLowerCase());
  }
  
  // 添加自定义正则模式
  addPattern(pattern: RegExp) {
    this.patterns.push(pattern);
  }
  
  // 从外部源更新词库
  async updateFromSource(url?: string) {
    if (!url) return;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.words) {
        data.words.forEach((word: string) => this.addWord(word));
      }
      
      if (data.patterns) {
        data.patterns.forEach((pattern: string) => {
          this.addPattern(new RegExp(pattern, 'i'));
        });
      }
      
      console.log('Sensitive words filter updated from source');
    } catch (error) {
      console.error('Failed to update sensitive words from source:', error);
    }
  }
}

// 导出单例实例
export const sensitiveWordsFilter = SensitiveWordsFilter.getInstance();
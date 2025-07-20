import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// 定义需要的6种风格
const REQUIRED_STYLES = ['natural', 'anime', 'oil', 'watercolor', 'pixel', 'ghibli'];

export async function GET() {
  try {
    const examplesByStyle = new Map<string, any[]>();
    
    // 为每种风格获取最新的图片
    for (const style of REQUIRED_STYLES) {
      const { data, error } = await supabaseServer
        .from('generation_history')
        .select('*')
        .eq('parameters->>style', style)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10); // 获取每种风格的10张图片，增加找到更合适图片的机会

      console.log(`查询风格 "${style}": 找到 ${data?.length || 0} 张图片`);
      
      const styleExamples = [];
      
      if (!error && data && data.length > 0) {
        // 添加找到的图片，过滤掉外部链接（可能过期）
        for (const item of data) {
          // 只使用 Supabase 存储的图片，避免外部链接过期问题
          if (item.image_url && item.image_url.includes('supabase.co')) {
            // 对于动漫风格，优先选择更合适的图片
            if (style === 'anime') {
              const prompt = item.prompt.toLowerCase();
              // 跳过不太合适的prompt，包括带有奇怪视角的公主图片
              if (prompt === 'handsome boy' || 
                  prompt.includes('sexy') || 
                  item.id === '3a82351a-8bf6-4f0d-aa4a-2f73082e37d8') { // 跳过不合适的公主图片
                continue;
              }
              // 优先选择特定ID的图片（smart girl）
              if (item.id === '2ed6eb46-13b4-4e25-ad9b-e15be6c7f8a4') {
                // 将这个图片插入到开头
                styleExamples.unshift({
                  id: `${style}-1`,
                  imageUrl: item.image_url,
                  prompt: item.prompt,
                  style: getStyleDisplayName(style),
                  createdAt: item.created_at
                });
              } else {
                styleExamples.push({
                  id: `${style}-${styleExamples.length + 1}`,
                  imageUrl: item.image_url,
                  prompt: item.prompt,
                  style: getStyleDisplayName(style),
                  createdAt: item.created_at
                });
              }
            } else {
              styleExamples.push({
                id: `${style}-${styleExamples.length + 1}`,
                imageUrl: item.image_url,
                prompt: item.prompt,
                style: getStyleDisplayName(style),
                createdAt: item.created_at
              });
            }
            // 每种风格最多保留2张
            if (styleExamples.length >= 2) break;
          }
        }
        console.log(`  风格 "${style}" 添加了 ${styleExamples.length} 张图片`);
      } else {
        console.log(`  风格 "${style}" 查询错误或无数据:`, error);
      }
      
      examplesByStyle.set(style, styleExamples);
    }
    
    // 组合所有风格的图片，确保每种风格都有机会展示
    const examples = [];
    
    // 首先确保每种风格至少有一张图片
    for (const [style, styleExamples] of examplesByStyle) {
      if (styleExamples.length > 0) {
        examples.push(styleExamples[0]);
      } else {
        // 如果没有真实图片，添加占位图
        examples.push({
          id: `${style}-placeholder-1`,
          imageUrl: `/gallery/${style}-style.svg`,
          prompt: getDefaultPrompt(style),
          style: getStyleDisplayName(style),
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // 如果还需要更多图片来达到8张，添加第二张图片
    if (examples.length < 8) {
      // 优先添加 natural 和 anime 的第二张
      const priorityStyles = ['natural', 'anime'];
      for (const style of priorityStyles) {
        const styleExamples = examplesByStyle.get(style) || [];
        if (styleExamples.length > 1 && examples.length < 8) {
          examples.push(styleExamples[1]);
        } else if (styleExamples.length === 0 && examples.length < 8) {
          // 添加第二个占位图
          examples.push({
            id: `${style}-placeholder-2`,
            imageUrl: `/gallery/${style}-style-2.svg`,
            prompt: getDefaultPrompt(style, true),
            style: getStyleDisplayName(style),
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    // 确保返回8张图片
    const finalExamples = examples.slice(0, 8);
    
    console.log(`\n最终返回 ${finalExamples.length} 张图片`);
    console.log('风格分布:', finalExamples.map(e => e.style).reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {}));

    return NextResponse.json({
      success: true,
      examples: finalExamples
    });

  } catch (error) {
    console.error('获取展示图片失败:', error);
    
    // 返回默认的占位图
    const defaultExamples = [
      {
        id: '1',
        imageUrl: '/gallery/natural-style.svg',
        prompt: '北极光下的雪山湖泊，倒影出绚烂的极光色彩',
        style: '自然'
      },
      {
        id: '2',
        imageUrl: '/gallery/anime-style.svg',
        prompt: '在樱花盛开的日本庭院中，一只可爱的柴犬坐在石灯笼旁，阳光透过花瓣洒下',
        style: '动漫'
      },
      {
        id: '3',
        imageUrl: '/gallery/oil-style.svg',
        prompt: '梵高风格的星空下，一片金色的向日葵田在微风中摇曳',
        style: '油画'
      },
      {
        id: '4',
        imageUrl: '/gallery/watercolor-style.svg',
        prompt: '水彩画风格的威尼斯运河，贡多拉船夫在夕阳下划船',
        style: '水彩'
      },
      {
        id: '5',
        imageUrl: '/gallery/pixel-style.svg',
        prompt: '像素艺术风格的复古游戏场景，勇者在城堡前准备冒险',
        style: '像素'
      },
      {
        id: '6',
        imageUrl: '/gallery/ghibli-style.svg',
        prompt: '吉卜力风格的乡村小屋，被鲜花和蝴蝶环绕，充满童话色彩',
        style: '吉卜力'
      },
      {
        id: '7',
        imageUrl: '/gallery/natural-style-2.svg',
        prompt: '清晨的森林小径，阳光透过树叶洒下斑驳光影，薄雾缭绕',
        style: '自然'
      },
      {
        id: '8',
        imageUrl: '/gallery/anime-style-2.svg',
        prompt: '魔法少女站在星空下的湖边，手中散发着柔和的光芒',
        style: '动漫'
      }
    ];

    return NextResponse.json({
      success: true,
      examples: defaultExamples
    });
  }
}

// 获取风格的显示名称
function getStyleDisplayName(style: string): string {
  const styleMap: Record<string, string> = {
    'natural': '自然',
    'anime': '动漫',
    'oil': '油画',
    'watercolor': '水彩',
    'pixel': '像素',
    'ghibli': '吉卜力'
  };
  return styleMap[style] || style;
}

// 获取默认提示词
function getDefaultPrompt(style: string, isSecond = false): string {
  const prompts: Record<string, string[]> = {
    'natural': [
      '北极光下的雪山湖泊，倒影出绚烂的极光色彩',
      '清晨的森林小径，阳光透过树叶洒下斑驳光影，薄雾缭绕'
    ],
    'anime': [
      '在樱花盛开的日本庭院中，一只可爱的柴犬坐在石灯笼旁，阳光透过花瓣洒下',
      '魔法少女站在星空下的湖边，手中散发着柔和的光芒'
    ],
    'oil': ['梵高风格的星空下，一片金色的向日葵田在微风中摇曳'],
    'watercolor': ['水彩画风格的威尼斯运河，贡多拉船夫在夕阳下划船'],
    'pixel': ['像素艺术风格的复古游戏场景，勇者在城堡前准备冒险'],
    'ghibli': ['吉卜力风格的乡村小屋，被鲜花和蝴蝶环绕，充满童话色彩']
  };
  
  const stylePrompts = prompts[style] || ['AI生成的艺术作品'];
  return stylePrompts[isSecond ? 1 : 0] || stylePrompts[0];
}
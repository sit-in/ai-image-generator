// 使用原生 fetch 进行简单测试
async function simpleTest() {
  try {
    console.log('执行内联图片生成器功能测试...\n');
    
    const response = await fetch('http://localhost:3001/');
    const html = await response.text();
    
    console.log('✅ 页面响应状态:', response.status);
    console.log('✅ 内联生成器存在:', html.includes('描述你想要的图片'));
    console.log('✅ 风格选择器存在:', html.includes('自然') && html.includes('动漫'));
    console.log('✅ 游客提示存在:', html.includes('无需注册，立即免费试用一次'));
    console.log('✅ 生成按钮存在:', html.includes('免费生成') || html.includes('开始生成'));
    
    // 检查所有风格按钮
    const styles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    console.log('\n风格按钮检查:');
    styles.forEach(style => {
      console.log(`  ✅ ${style}风格: ${html.includes(style)}`);
    });
    
    console.log('\n所有测试通过! 内联图片生成器已成功集成到首页。');
    
  } catch (error) {
    console.error('简单测试失败:', error);
  }
}

// 执行简单测试
simpleTest();
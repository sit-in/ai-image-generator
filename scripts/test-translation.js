// 测试翻译功能
const { PromptOptimizer } = require('../lib/prompt-optimizer.ts');

console.log('测试中文翻译功能...\n');

const testCases = [
  '夕阳下的富士山',
  '樱花飘落的街道',
  '一只可爱的猫',
  '美丽的彩虹独角兽',
  '春天的樱花',
  '夜晚的星空',
  '宁静的湖泊倒映着雪山',
  '一个女孩在花园里跳舞',
  '梦幻的城堡在云端',
  '海边的日出'
];

console.log('测试用例：\n');
testCases.forEach((testCase, index) => {
  const result = PromptOptimizer.optimize(testCase, 'natural');
  console.log(`${index + 1}. 原文: "${testCase}"`);
  console.log(`   翻译: "${result.translatedPrompt}"`);
  console.log(`   优化: "${result.optimizedPrompt}"`);
  console.log('---');
});

// 测试不同风格
console.log('\n测试不同风格的优化：\n');
const styles = ['natural', 'anime', 'oil', 'watercolor', 'pixel', 'ghibli'];
const testPrompt = '夕阳下的富士山';

styles.forEach(style => {
  const result = PromptOptimizer.optimize(testPrompt, style);
  console.log(`风格: ${style}`);
  console.log(`优化后: "${result.optimizedPrompt}"`);
  console.log('---');
});
/**
 * 管理员权限验证测试脚本
 * 使用方法: node tests/admin-auth-test.js
 */

async function testAdminAuth() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🔍 管理员权限验证测试\n');
  
  // 测试1: 未登录访问
  console.log('1️⃣ 测试未登录访问管理员API...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/test-auth`);
    const data = await response.json();
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应:`, data);
    console.log(response.status === 401 ? '   ✅ 正确拒绝未登录访问' : '   ❌ 错误：应该返回401');
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
  
  console.log('\n2️⃣ 测试无效Token访问...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/test-auth`, {
      headers: {
        'Authorization': 'Bearer invalid-token-12345'
      }
    });
    const data = await response.json();
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应:`, data);
    console.log(response.status === 401 ? '   ✅ 正确拒绝无效Token' : '   ❌ 错误：应该返回401');
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
  
  console.log('\n3️⃣ 测试管理员API路由保护...');
  const adminRoutes = [
    '/api/admin/generate-codes',
    '/api/admin/cleanup-images'
  ];
  
  for (const route of adminRoutes) {
    try {
      const response = await fetch(`${baseUrl}${route}`);
      console.log(`   ${route}: ${response.status} ${response.status === 401 || response.status === 405 ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   ${route}: ❌ 请求失败`);
    }
  }
  
  console.log('\n4️⃣ 测试中间件拦截...');
  try {
    const response = await fetch(`${baseUrl}/admin/redeem-codes`);
    console.log(`   /admin/redeem-codes 页面: ${response.status}`);
    if (response.status === 200 && response.redirected) {
      console.log(`   ✅ 正确重定向到登录页面`);
    } else if (response.status === 403) {
      console.log(`   ✅ 正确返回403禁止访问`);
    } else {
      console.log(`   ❌ 错误：应该重定向或返回403`);
    }
  } catch (error) {
    console.log('   ❌ 请求失败:', error.message);
  }
  
  console.log('\n✨ 测试完成！');
  console.log('\n💡 提示：要测试完整的管理员功能，请：');
  console.log('   1. 使用管理员账号登录');
  console.log('   2. 从浏览器开发者工具复制认证Token');
  console.log('   3. 使用真实Token测试管理员API');
}

// 运行测试
testAdminAuth().catch(console.error);
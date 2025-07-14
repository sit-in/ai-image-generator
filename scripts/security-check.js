#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class SecurityChecker {
  constructor() {
    this.issues = []
    this.warnings = []
    this.info = []
  }

  // 检查环境变量
  checkEnvVariables() {
    console.log('🔍 检查环境变量...')
    
    const envFile = path.join(__dirname, '../.env.local')
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8')
      
      // 检查必要的环境变量
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'REPLICATE_API_TOKEN'
      ]
      
      requiredVars.forEach(varName => {
        if (!envContent.includes(varName)) {
          this.issues.push(`缺少必要的环境变量: ${varName}`)
        }
      })
      
      // 检查是否有硬编码的密钥
      const secretPatterns = [
        /sk-[a-zA-Z0-9]{20,}/g,
        /pk-[a-zA-Z0-9]{20,}/g,
        /password.*=.*[^*]/i,
        /secret.*=.*[^*]/i
      ]
      
      secretPatterns.forEach(pattern => {
        const matches = envContent.match(pattern)
        if (matches) {
          this.warnings.push(`检测到可能的硬编码密钥: ${matches[0].substring(0, 10)}...`)
        }
      })
    } else {
      this.issues.push('未找到 .env.local 文件')
    }
  }

  // 检查代码中的安全问题
  checkCodeSecurity() {
    console.log('🔍 检查代码安全...')
    
    const codeFiles = this.getAllFiles('./app', ['.ts', '.tsx', '.js', '.jsx'])
    
    codeFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      
      // 检查危险的代码模式
      const dangerousPatterns = [
        { pattern: /eval\s*\(/g, message: '使用了 eval() 函数' },
        { pattern: /innerHTML\s*=/g, message: '使用了 innerHTML' },
        { pattern: /document\.write/g, message: '使用了 document.write' },
        { pattern: /window\.location\.href\s*=/g, message: '直接修改 window.location.href' },
        { pattern: /process\.env\.[A-Z_]+/g, message: '在客户端代码中使用了 process.env' }
      ]
      
      dangerousPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(content)) {
          this.warnings.push(`${file}: ${message}`)
        }
      })
      
      // 检查是否有注释掉的密钥
      const commentedSecrets = [
        /\/\/.*sk-[a-zA-Z0-9]/g,
        /\/\*.*sk-[a-zA-Z0-9]/g,
        /#.*sk-[a-zA-Z0-9]/g
      ]
      
      commentedSecrets.forEach(pattern => {
        if (pattern.test(content)) {
          this.warnings.push(`${file}: 注释中可能包含密钥`)
        }
      })
    })
  }

  // 检查依赖包安全
  checkDependencySecurity() {
    console.log('🔍 检查依赖包安全...')
    
    try {
      // 检查是否有已知的漏洞
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditOutput)
      
      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([name, vuln]) => {
          if (vuln.severity === 'critical' || vuln.severity === 'high') {
            this.issues.push(`依赖包 ${name} 存在 ${vuln.severity} 级别安全漏洞`)
          } else if (vuln.severity === 'moderate') {
            this.warnings.push(`依赖包 ${name} 存在 ${vuln.severity} 级别安全漏洞`)
          }
        })
      }
    } catch (error) {
      this.warnings.push('无法检查依赖包安全性')
    }
  }

  // 检查文件权限
  checkFilePermissions() {
    console.log('🔍 检查文件权限...')
    
    const sensitiveFiles = [
      '.env.local',
      '.env',
      'next.config.mjs',
      'package.json'
    ]
    
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file)
        const mode = stats.mode.toString(8)
        
        // 检查文件是否对所有人可读
        if (mode.endsWith('4') || mode.endsWith('6') || mode.endsWith('7')) {
          this.warnings.push(`文件 ${file} 权限可能过于宽松: ${mode}`)
        }
      }
    })
  }

  // 检查Git配置
  checkGitSecurity() {
    console.log('🔍 检查Git配置...')
    
    // 检查是否有敏感文件被跟踪
    const gitignoreFile = '.gitignore'
    if (fs.existsSync(gitignoreFile)) {
      const gitignoreContent = fs.readFileSync(gitignoreFile, 'utf8')
      
      const requiredIgnores = [
        '.env',
        '.env.local',
        '.env.*.local',
        'node_modules',
        '.next'
      ]
      
      requiredIgnores.forEach(ignore => {
        if (!gitignoreContent.includes(ignore)) {
          this.warnings.push(`gitignore 中缺少: ${ignore}`)
        }
      })
    } else {
      this.issues.push('未找到 .gitignore 文件')
    }
    
    // 检查是否有敏感文件被提交
    try {
      const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n')
      const sensitivePatterns = [
        /\.env/,
        /\.key$/,
        /\.pem$/,
        /password/i,
        /secret/i
      ]
      
      trackedFiles.forEach(file => {
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(file)) {
            this.issues.push(`敏感文件已被跟踪: ${file}`)
          }
        })
      })
    } catch (error) {
      this.info.push('无法检查Git文件，可能不在Git仓库中')
    }
  }

  // 获取所有文件
  getAllFiles(dir, extensions) {
    const files = []
    
    const walk = (currentDir) => {
      const items = fs.readdirSync(currentDir)
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath)
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath)
        }
      })
    }
    
    walk(dir)
    return files
  }

  // 生成报告
  generateReport() {
    console.log('\n📊 安全检查报告')
    console.log('=' + '='.repeat(50))
    
    if (this.issues.length > 0) {
      console.log('\n❌ 严重问题:')
      this.issues.forEach(issue => console.log(`  - ${issue}`))
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:')
      this.warnings.forEach(warning => console.log(`  - ${warning}`))
    }
    
    if (this.info.length > 0) {
      console.log('\n💡 信息:')
      this.info.forEach(info => console.log(`  - ${info}`))
    }
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ 未发现安全问题')
    }
    
    console.log('\n建议:')
    console.log('  1. 定期更新依赖包')
    console.log('  2. 使用环境变量存储敏感信息')
    console.log('  3. 启用HTTPS和安全头')
    console.log('  4. 定期进行安全审计')
    console.log('  5. 使用内容安全策略(CSP)')
    
    // 返回退出代码
    return this.issues.length > 0 ? 1 : 0
  }

  // 运行所有检查
  async run() {
    console.log('🔐 开始安全检查...\n')
    
    this.checkEnvVariables()
    this.checkCodeSecurity()
    this.checkDependencySecurity()
    this.checkFilePermissions()
    this.checkGitSecurity()
    
    return this.generateReport()
  }
}

// 运行安全检查
if (require.main === module) {
  const checker = new SecurityChecker()
  checker.run().then(exitCode => {
    process.exit(exitCode)
  }).catch(error => {
    console.error('安全检查失败:', error)
    process.exit(1)
  })
}

module.exports = SecurityChecker
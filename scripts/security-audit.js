#!/usr/bin/env node

/**
 * Security Audit Script
 * Performs various security checks on the application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 Starting Security Audit...\n');

// 1. Check for npm vulnerabilities
console.log('1. Checking npm vulnerabilities...');
try {
  execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ No npm vulnerabilities found\n');
} catch (error) {
  console.log('❌ npm vulnerabilities detected. Run "npm audit fix" to resolve.\n');
}

// 2. Check for hardcoded secrets
console.log('2. Scanning for hardcoded secrets...');
const secretPatterns = [
  /password\s*=\s*['"][^'"]+['"]/gi,
  /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
  /secret\s*=\s*['"][^'"]+['"]/gi,
  /token\s*=\s*['"][^'"]+['"]/gi,
  /private[_-]?key\s*=\s*['"][^'"]+['"]/gi,
];

function scanDirectory(dir, exclude = []) {
  const files = fs.readdirSync(dir);
  let issuesFound = false;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!exclude.includes(file)) {
        const result = scanDirectory(filePath, exclude);
        if (result) issuesFound = true;
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const pattern of secretPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`⚠️  Potential secret found in ${filePath}:`);
          matches.forEach(match => console.log(`   ${match}`));
          issuesFound = true;
        }
      }
    }
  }
  
  return issuesFound;
}

const secretsFound = scanDirectory('./src', ['node_modules', '.git', 'dist']);
if (!secretsFound) {
  console.log('✅ No hardcoded secrets detected\n');
} else {
  console.log('❌ Potential hardcoded secrets found. Please review and move to environment variables.\n');
}

// 3. Check environment variables
console.log('3. Checking environment configuration...');
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnvVars = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
}

if (missingEnvVars.length === 0) {
  console.log('✅ All required environment variables are set\n');
} else {
  console.log('❌ Missing environment variables:');
  missingEnvVars.forEach(envVar => console.log(`   ${envVar}`));
  console.log('');
}

// 4. Check for insecure dependencies
console.log('4. Checking for insecure dependency patterns...');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const insecurePatterns = [
  { name: 'eval', reason: 'Can execute arbitrary code' },
  { name: 'vm2', reason: 'Has known sandbox escape vulnerabilities' },
  { name: 'serialize-javascript', reason: 'Can lead to XSS if not properly sanitized' }
];

let insecureDepsFound = false;
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

for (const [depName, version] of Object.entries(allDeps)) {
  for (const pattern of insecurePatterns) {
    if (depName.includes(pattern.name)) {
      console.log(`⚠️  Potentially insecure dependency: ${depName}@${version}`);
      console.log(`   Reason: ${pattern.reason}`);
      insecureDepsFound = true;
    }
  }
}

if (!insecureDepsFound) {
  console.log('✅ No obviously insecure dependencies detected\n');
} else {
  console.log('');
}

// 5. Check file permissions (Unix-like systems only)
console.log('5. Checking critical file permissions...');
const criticalFiles = [
  '.env',
  '.env.production',
  'package.json',
  'package-lock.json'
];

let permissionIssues = false;
for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    try {
      const stats = fs.statSync(file);
      const mode = stats.mode & parseInt('777', 8);
      
      // Check if file is world-readable (not recommended for .env files)
      if (file.startsWith('.env') && (mode & parseInt('004', 8))) {
        console.log(`⚠️  ${file} is world-readable (permissions: ${mode.toString(8)})`);
        permissionIssues = true;
      }
    } catch (error) {
      // Ignore permission check errors on non-Unix systems
    }
  }
}

if (!permissionIssues) {
  console.log('✅ File permissions look good\n');
} else {
  console.log('');
}

// 6. Check for security headers configuration
console.log('6. Checking security configuration...');
const securityConfigPath = './src/server/config/security.ts';
if (fs.existsSync(securityConfigPath)) {
  const securityConfig = fs.readFileSync(securityConfigPath, 'utf8');
  
  const requiredSecurityFeatures = [
    'helmet',
    'contentSecurityPolicy',
    'hsts',
    'xssFilter',
    'noSniff'
  ];
  
  let missingFeatures = [];
  for (const feature of requiredSecurityFeatures) {
    if (!securityConfig.includes(feature)) {
      missingFeatures.push(feature);
    }
  }
  
  if (missingFeatures.length === 0) {
    console.log('✅ Security configuration includes all recommended features\n');
  } else {
    console.log('⚠️  Missing security features:');
    missingFeatures.forEach(feature => console.log(`   ${feature}`));
    console.log('');
  }
} else {
  console.log('❌ Security configuration file not found\n');
}

console.log('🔒 Security audit completed!');
console.log('\nRecommendations:');
console.log('- Run "npm audit" regularly to check for vulnerabilities');
console.log('- Keep dependencies updated');
console.log('- Use environment variables for all secrets');
console.log('- Enable HTTPS in production');
console.log('- Implement proper input validation');
console.log('- Use rate limiting on all endpoints');
console.log('- Monitor logs for suspicious activity');
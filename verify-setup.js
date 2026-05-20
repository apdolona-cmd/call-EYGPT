#!/usr/bin/env node

/**
 * Firebase Setup Verification Script
 * This script helps verify that Firebase is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Setup Verification\n');
console.log('=' .repeat(50));

// 1. Check firebase.ts exists
console.log('\n1️⃣ Checking firebase.ts...');
const firebaseFile = path.join(__dirname, '../src/lib/firebase.ts');
if (fs.existsSync(firebaseFile)) {
  console.log('✅ firebase.ts exists');
  const content = fs.readFileSync(firebaseFile, 'utf-8');
  
  // Check for required imports
  if (content.includes('getDatabase') && content.includes('onValue') && content.includes('set')) {
    console.log('✅ Firebase Realtime Database imports found');
  } else {
    console.log('❌ Missing Firebase Realtime Database imports');
  }
  
  if (content.includes('startCloudListener')) {
    console.log('✅ startCloudListener function found');
  } else {
    console.log('❌ startCloudListener function missing');
  }
  
  if (content.includes('saveSettingsInstant')) {
    console.log('✅ saveSettingsInstant function found');
  } else {
    console.log('❌ saveSettingsInstant function missing');
  }
} else {
  console.log('❌ firebase.ts not found!');
}

// 2. Check useSettings hook
console.log('\n2️⃣ Checking useSettings.ts...');
const hookFile = path.join(__dirname, '../src/hooks/useSettings.ts');
if (fs.existsSync(hookFile)) {
  console.log('✅ useSettings.ts exists');
  const content = fs.readFileSync(hookFile, 'utf-8');
  
  if (content.includes('startCloudListener')) {
    console.log('✅ Uses startCloudListener for real-time sync');
  } else {
    console.log('❌ Does not use startCloudListener');
  }
} else {
  console.log('❌ useSettings.ts not found!');
}

// 3. Check AdminPanel
console.log('\n3️⃣ Checking AdminPanel.tsx...');
const adminFile = path.join(__dirname, '../src/screens/AdminPanel.tsx');
if (fs.existsSync(adminFile)) {
  console.log('✅ AdminPanel.tsx exists');
  const content = fs.readFileSync(adminFile, 'utf-8');
  
  if (content.includes('saveSettingsInstant')) {
    console.log('✅ Uses saveSettingsInstant for saving');
  } else {
    console.log('❌ Does not use saveSettingsInstant');
  }
  
  if (!content.includes('saveToCloud')) {
    console.log('✅ Removed old saveToCloud function');
  } else {
    console.log('⚠️ Still contains old saveToCloud function');
  }
} else {
  console.log('❌ AdminPanel.tsx not found!');
}

// 4. Check FIREBASE_SETUP.md
console.log('\n4️⃣ Checking FIREBASE_SETUP.md...');
const setupFile = path.join(__dirname, '../FIREBASE_SETUP.md');
if (fs.existsSync(setupFile)) {
  console.log('✅ FIREBASE_SETUP.md exists');
  const content = fs.readFileSync(setupFile, 'utf-8');
  
  if (content.includes('Realtime Database')) {
    console.log('✅ Mentions Realtime Database');
  } else {
    console.log('⚠️ Does not mention Realtime Database');
  }
} else {
  console.log('❌ FIREBASE_SETUP.md not found!');
}

console.log('\n' + '='.repeat(50));
console.log('\n📋 Next Steps:');
console.log('1. Make sure you updated Realtime Database Rules');
console.log('2. Run: npm run dev');
console.log('3. Test on two different devices/browsers');
console.log('4. Check Console (F12) for sync messages');
console.log('\n');

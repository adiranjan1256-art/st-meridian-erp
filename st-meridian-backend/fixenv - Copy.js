const j   = require('C:/Users/Asus/Downloads/st-meridian-erp-718d6-firebase-adminsdk-fbsvc-61d00218c5.json');
const fs  = require('fs');

let env = fs.readFileSync('.env', 'utf8');

const fixedKey = j.private_key.replace(/\n/g, '\\n');

// Remove old FIREBASE_PRIVATE_KEY line and replace it
env = env.replace(/FIREBASE_PRIVATE_KEY=[\s\S]*?(?=\n[A-Z]|$)/, `FIREBASE_PRIVATE_KEY="${fixedKey}"`);

fs.writeFileSync('.env', env);
console.log('✅ Fixed! Key starts with:', fixedKey.substring(0, 60));
const j  = require('C:/Users/Asus/Downloads/st-meridian-erp-718d6-firebase-adminsdk-fbsvc-61d00218c5.json');
const fs = require('fs');

let env = fs.readFileSync('.env', 'utf8');

env = env.replace(/FIREBASE_PROJECT_ID=.*/,  `FIREBASE_PROJECT_ID=${j.project_id}`);
env = env.replace(/FIREBASE_CLIENT_EMAIL=.*/, `FIREBASE_CLIENT_EMAIL=${j.client_email}`);

const fixedKey = j.private_key.replace(/\n/g, '\\n');
env = env.replace(/FIREBASE_PRIVATE_KEY=[\s\S]*?(?=\n[A-Z]|$)/, `FIREBASE_PRIVATE_KEY="${fixedKey}"`);

fs.writeFileSync('.env', env);
console.log('✅ All fixed!');
console.log('PROJECT_ID:   ', j.project_id);
console.log('CLIENT_EMAIL: ', j.client_email);
console.log('KEY starts:   ', fixedKey.substring(0, 50));
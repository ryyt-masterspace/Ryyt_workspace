/* eslint-disable @typescript-eslint/no-require-imports */
const { config } = require('dotenv');
const { resolve } = require('path');
const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');

// 1. Manually Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error("❌ Could not read .env.local file:", e.message);
    process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length > 0) {
        envVars[key.trim()] = vals.join('=').trim().replace(/(^"|"$)/g, ''); // strip quotes
    }
});

const KEY_ID = envVars.RAZORPAY_KEY_ID;
const KEY_SECRET = envVars.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
    console.error("❌ Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env.local");
    process.exit(1);
}

console.log(`✅ Loaded Razorpay Keys from .env.local`);

// 2. Fetch Plans from Razorpay
const razorpay = new Razorpay({
    key_id: KEY_ID,
    key_secret: KEY_SECRET,
});

async function main() {
    try {
        console.log("🔄 Fetching Plans from Razorpay...");
        const response = await razorpay.plans.all();
        const activePlans = response.items;

        console.log(`\n--- Active Plans in Razorpay ---`);
        activePlans.forEach(p => {
            console.log(`- ${p.item.name} (${p.period}ly): ${p.id}`);
        });

        // 3. Compare with Configured IDs
        console.log(`\n--- Configuration Check ---`);
        const checks = [
            { key: 'RAZORPAY_PLAN_STARTUP', term: 'Startup', id: envVars.RAZORPAY_PLAN_STARTUP },
            { key: 'RAZORPAY_PLAN_GROWTH', term: 'Growth', id: envVars.RAZORPAY_PLAN_GROWTH },
            { key: 'RAZORPAY_PLAN_SCALE', term: 'Scale', id: envVars.RAZORPAY_PLAN_SCALE },
        ];

        let hasMismatch = false;

        checks.forEach(check => {
            // Find the plan in Razorpay list that looks like it (fuzzy match or manual verification needed if names differ)
            // But here we rely on the ID matching.
            // We want to see if the ID in env matches ANY active plan.
            const matchingPlan = activePlans.find(p => p.id === check.id);

            if (matchingPlan) {
                console.log(`✅ ${check.key}: MATCHED (${matchingPlan.item.name}) -> ${check.id}`);
            } else {
                console.log(`❌ ${check.key}: MISMATCH/INVALID -> ${check.id || '(Not Set)'}`);
                hasMismatch = true;

                // Try to guess the correct one?
                const guess = activePlans.find(p => p.item.name.toLowerCase().includes(check.term.toLowerCase()));
                if (guess) {
                    console.log(`   👉 Suggested Fix: Use ${guess.id} (${guess.item.name})`);
                }
            }
        });

        if (hasMismatch) {
            console.log("\n⚠️  MISMATCH FOUND. Autocorrecting .env.local...");
        } else {
            console.log("\n✅ Configuration is valid. Forcing a refresh to ensure no hidden characters...");
        }

        // Force Update Logic
        let newEnvContent = envContent;

        // Helper to replace/add
        const updateVar = (key, value) => {
            const regex = new RegExp(`^${key}=.*`, 'm');
            if (regex.test(newEnvContent)) {
                newEnvContent = newEnvContent.replace(regex, `${key}=${value}`);
            } else {
                newEnvContent += `\n${key}=${value}`;
            }
        };

        // Find correct IDs
        const startupPlan = activePlans.find(p => p.item.name.toLowerCase().includes('startup'));
        const growthPlan = activePlans.find(p => p.item.name.toLowerCase().includes('growth'));
        const scalePlan = activePlans.find(p => p.item.name.toLowerCase().includes('scale'));

        if (startupPlan) updateVar('RAZORPAY_PLAN_STARTUP', startupPlan.id);
        if (growthPlan) updateVar('RAZORPAY_PLAN_GROWTH', growthPlan.id);
        if (scalePlan) updateVar('RAZORPAY_PLAN_SCALE', scalePlan.id);

        fs.writeFileSync(envPath, newEnvContent, 'utf8');
        console.log("🔥 .env.local has been updated with FRESH IDs from Razorpay API.");
        console.log("👉 PLEASE RESTART YOUR SERVER NOW (Ctrl+C, then npm run dev)");

    } catch (error) {
        console.error("❌ API Error:", error);
    }
}

main();

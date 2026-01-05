import * as admin from 'firebase-admin';

// Helper: Robust Private Key Formatter
function formatPrivateKey(key: string | undefined) {
    if (!key) return undefined;

    // 1. Remove wrapping double quotes if they exist (Common Vercel/Env issue)
    if (key.startsWith('"') && key.endsWith('"')) {
        key = key.slice(1, -1);
    }

    // 2. Replace escaped newlines
    const formattedKey = key.replace(/\\n/g, '\n');

    // 3. Check for the header
    if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error("❌ Invalid Key Format. Starts with:", formattedKey.substring(0, 10));
        return undefined;
    }

    return formattedKey;
}

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
    // Attempt to format the key if it exists
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    // Only attempt initialization if specific credentials are present
    // This allows the build to pass if env vars are missing
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            console.log('[FirebaseAdmin] Initialized Successfully');
        } catch (error) {
            console.error('[FirebaseAdmin] Initialization Error:', error);
        }
    } else {
        // Detailed warning to help debug
        if (!process.env.FIREBASE_PRIVATE_KEY) {
            console.warn('[FirebaseAdmin] Missing FIREBASE_PRIVATE_KEY. Skipping initialization.');
        } else if (!privateKey) {
            console.error('[FirebaseAdmin] FIREBASE_PRIVATE_KEY present but invalid. Skipping initialization.');
        } else {
            console.warn('[FirebaseAdmin] Missing Project ID or Client Email. Skipping initialization.');
        }
    }
}

export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
export const adminAuth = admin.apps.length ? admin.auth() : null as unknown as admin.auth.Auth;

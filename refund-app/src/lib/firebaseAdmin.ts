import * as admin from 'firebase-admin';

// 1. Get the key
const rawKey = process.env.FIREBASE_PRIVATE_KEY;

// 2. Sanitize: Replace literal "\n" with actual newlines
// Use a robust check to ensure we don't crash if the key is missing
const privateKey = rawKey
    ? rawKey.replace(/\\n/g, '\n')
    : undefined;

// 3. Validation
if (!privateKey) {
    console.error("❌ FIREBASE_PRIVATE_KEY is missing or empty. (Skipping for build)");
}

// 4. Initialize (with safety check)
if (!admin.apps.length) {
    if (privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log('[FirebaseAdmin] Initialized Successfully');
    } else {
        console.warn('[FirebaseAdmin] Missing credentials. Skipping initialization.');
    }
}

export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
export const adminAuth = admin.apps.length ? admin.auth() : null as unknown as admin.auth.Auth;

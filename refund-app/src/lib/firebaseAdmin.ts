import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle escaped newlines in local env or Vercel
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('[FirebaseAdmin] Initialized Successfully');
    } catch (error) {
        console.error('[FirebaseAdmin] Initialization Error:', error);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

import admin from "firebase-admin";

let initialized = false;

/**
 * Firebase Admin — verifies phone OTP ID tokens from the mobile app.
 *
 * Set ONE of:
 * - FIREBASE_SERVICE_ACCOUNT = full JSON string of the service account
 * - OR FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 */
export function getFirebaseAdmin() {
  if (initialized && admin.apps.length) {
    return admin;
  }

  if (admin.apps.length) {
    initialized = true;
    return admin;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (json) {
    const parsed = JSON.parse(json) as admin.ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
    initialized = true;
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY"
    );
  }

  // Railway / .env often stores newlines as \n
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
  return admin;
}

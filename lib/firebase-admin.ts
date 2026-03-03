/**
 * Shared Firebase Admin SDK initializer.
 * Uses getApps() from firebase-admin/app for reliable singleton detection.
 * Never initializes at module level — always call initAdmin() inside handlers.
 */
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App;

export function initAdmin(): { app: App; auth: Auth; db: Firestore } {
  const apps = getApps();

  if (apps.length > 0) {
    app = getApp();
  } else {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY env var is not set");

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

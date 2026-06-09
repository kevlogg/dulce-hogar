"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig, isFirebaseClientConfigured } from "./config";

function getApp(): FirebaseApp {
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase no está configurado: definí NEXT_PUBLIC_FIREBASE_API_KEY y NEXT_PUBLIC_FIREBASE_PROJECT_ID en .env.local (copiá desde .env.example)."
    );
  }
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0] as FirebaseApp;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getApp());
}

export function getFirebaseFirestore(): Firestore {
  return getFirestore(getApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getApp());
}

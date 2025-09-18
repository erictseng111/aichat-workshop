// @ts-nocheck
// This is a global variable from index.html
const { initializeApp, getFirestore } = window.firebase;

// TODO: Add your Firebase project configuration here
// 1. Go to the Firebase Console (https://console.firebase.google.com/)
// 2. Create a new project.
// 3. In your project, go to Project Settings > General.
// 4. Under "Your apps", click the web icon (</>) to create a new web app.
// 5. Copy the firebaseConfig object here.
const firebaseConfig = {
  apiKey: "AIzaSyAkN6Obbo3qqa6LOyvTVyEaZVy1SnrPMrM",
  authDomain: "ai-workshop-app.firebaseapp.com",
  projectId: "ai-workshop-app",
  storageBucket: "ai-workshop-app.firebasestorage.app",
  messagingSenderId: "456908656117",
  appId: "1:456908656117:web:db183c4ed038cda53fe4bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Firebase SDK configuration for Ceia do Chef
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0RZpLDscY8zt38i6lBe2zBA_BuYAxVr4",
  authDomain: "agendaudi-c2eb7.firebaseapp.com",
  projectId: "agendaudi-c2eb7",
  storageBucket: "agendaudi-c2eb7.firebasestorage.app",
  messagingSenderId: "721139397608",
  appId: "1:721139397608:web:9dca1b4eb10635d9146a5d",
  measurementId: "G-8Q19BE74J1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

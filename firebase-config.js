// Firebase 설정 및 초기화 (Compat 버전 사용 - 모듈 시스템 없이 브라우저 전역 사용)
const firebaseConfig = {
  apiKey: "AIzaSyBpxHikrCZHjb5WTJjd4j0-4-IOcaetjCU",
  authDomain: "velto-58801.firebaseapp.com",
  projectId: "velto-58801",
  storageBucket: "velto-58801.firebasestorage.app",
  messagingSenderId: "114336583869",
  appId: "1:114336583869:web:30a28781a3862609ffa7d4",
  measurementId: "G-M4E3LD4ZJR"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

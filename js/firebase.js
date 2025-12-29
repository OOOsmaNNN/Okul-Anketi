// Firebase SDK zaten HTML'de yüklü olmalı

const firebaseConfig = {
  apiKey: "AIzaSyA-282TY4GC9334F103jaj7aXJdkf0XqMk",
  authDomain: "okul-anket-bd350.firebaseapp.com",
  projectId: "okul-anket-bd350",
  storageBucket: "okul-anket-bd350.firebasestorage.app",
  messagingSenderId: "916769218112",
  appId: "1:916769218112:web:4f7136222af6fd21de49a5"
};

// Firebase başlat
firebase.initializeApp(firebaseConfig);

// Servisler
const db = firebase.firestore();
const auth = firebase.auth();

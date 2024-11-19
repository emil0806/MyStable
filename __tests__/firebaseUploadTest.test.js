import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyAZmzDzMA_l53Sl6Cfi3oAjB3eVI2UZdIY",
  authDomain: "mystable-983a0.firebaseapp.com",
  projectId: "mystable-983a0",
  storageBucket: "mystable-983a0.appspot.com",
  messagingSenderId: "125084559501",
  appId: "1:125084559501:web:73cfe42dc213809e45dac4",
  measurementId: "G-C9WW0W6F80",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

describe("Firebase Upload Test", () => {
  test("Uploader og henter samme data", async () => {
    const testDoc = {
      admin: "test-admin-id",
      email: "test@test.dk",
      members: [],
      name: "Test Stable",
      numOfMembers: 0,
      phone: "12345678",
    };
    const docRef = doc(db, "stables", "testStableId");

    // Upload data
    await setDoc(docRef, testDoc);

    // Hent data
    const docSnapshot = await getDoc(docRef);

    // Kontroller, om data stemmer overens
    expect(docSnapshot.exists()).toBe(true);
    expect(docSnapshot.data()).toEqual(testDoc);
  });

  afterAll(async () => {
    await deleteDoc(doc(db, "stables", "testStableId"));
  });
});

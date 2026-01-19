
// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, writeBatch, orderBy, limit, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User
} from "firebase/auth";
import { Task, ChatMessage } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBvJr8s7PoGlrkdGLfZeKHhLrjYbBFz7KE",
  authDomain: "to-do-4c5f9.firebaseapp.com",
  projectId: "to-do-4c5f9",
  storageBucket: "to-do-4c5f9.firebasestorage.app",
  messagingSenderId: "689469923284",
  appId: "1:689469923284:web:0210fb994f769ad38e0041",
  measurementId: "G-V1K2L2SX1C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// --- Firestore Helpers ---

const TASKS_COLLECTION = 'todos'; 
const MESSAGES_COLLECTION = 'messages';

export const subscribeToTasks = (user: User, onUpdate: (tasks: Task[]) => void) => {
    if (!user) return () => {};

    const q = query(
        collection(db, TASKS_COLLECTION),
        where("userId", "==", user.uid)
    );

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id } as Task;
        });
        
        // Sort by createdAt descending
        tasks.sort((a, b) => b.createdAt - a.createdAt);
        
        onUpdate(tasks);
    }, (error) => {
        console.error("Firestore subscription error:", error);
    });
};

export const addTaskToCloud = async (user: User, task: Task) => {
    if (!user) return;
    try {
        await setDoc(doc(db, TASKS_COLLECTION, task.id), {
            ...task,
            userId: user.uid
        });
    } catch (e) {
        console.error("Error adding task to cloud:", e);
    }
};

export const updateTaskInCloud = async (taskId: string, updates: Partial<Task>) => {
    try {
        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        await updateDoc(taskRef, updates);
    } catch (e) {
        console.error("Error updating task in cloud:", e);
    }
};

export const deleteTaskFromCloud = async (taskId: string) => {
    try {
        await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (e) {
        console.error("Error deleting task from cloud:", e);
    }
};

export const batchUploadTasks = async (userId: string, tasks: Task[]) => {
    if (!userId || tasks.length === 0) return;
    
    const chunkSize = 500;
    for (let i = 0; i < tasks.length; i += chunkSize) {
        const chunk = tasks.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        
        chunk.forEach(task => {
            const docRef = doc(db, TASKS_COLLECTION, task.id);
            batch.set(docRef, { 
                ...task, 
                userId
            }, { merge: true });
        });

        try {
            await batch.commit();
        } catch (e) {
            console.error("Batch upload failed:", e);
        }
    }
};

// --- Chat Helpers ---

export const subscribeToChat = (onUpdate: (messages: ChatMessage[]) => void) => {
    const q = query(
        collection(db, MESSAGES_COLLECTION),
        orderBy("createdAt", "asc"),
        limit(100)
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id } as ChatMessage;
        });
        onUpdate(messages);
    }, (error) => {
        console.error("Chat subscription error:", error);
    });
};

export const sendMessage = async (text: string, user: User) => {
    if (!user || !text.trim()) return;

    try {
        await addDoc(collection(db, MESSAGES_COLLECTION), {
            text: text.trim(),
            senderId: user.uid,
            senderName: user.displayName || 'Anonymous',
            senderPhoto: user.photoURL || null,
            createdAt: Date.now()
        });
    } catch (e) {
        console.error("Error sending message:", e);
        throw e;
    }
};

// --- Auth Helpers ---

export const getLocalUserId = () => {
    if (typeof window === 'undefined') return 'server';
    let id = localStorage.getItem('liquid_guest_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('liquid_guest_id', id);
    }
    return id;
};

export const loginUser = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const registerUser = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const sendVerificationEmailToUser = async () => {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    }
};

export const reloadUser = async () => {
    if (auth.currentUser) {
        await auth.currentUser.reload();
        return auth.currentUser;
    }
    return null;
};

export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
};

export const logoutUser = async () => {
    await signOut(auth);
};

export const observeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const updateUserProfileName = async (name: string) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        await auth.currentUser.reload();
        return auth.currentUser;
    }
};

// Helper to generate SHA-1 signature for Cloudinary
async function sha1(str: string): Promise<string> {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
    return Array.from(new Uint8Array(hash))
      .map(v => v.toString(16).padStart(2, '0'))
      .join('');
}

export const uploadUserAvatar = async (file: File) => {
    const cloudName = "dj5hhott5";
    const apiKey = "678265544699348";
    const apiSecret = "8UhTDh2LLHYnwwrcLvYTDa-SQVc";
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureStr = `timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1(signatureStr);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Cloudinary upload failed: ${err.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const photoURL = data.secure_url;
    
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
    }
    
    return photoURL;
};

export type { User };
export { db, auth, storage };
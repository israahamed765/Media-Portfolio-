import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { ProfileData, ProjectData, SkillData, ContactMessage } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBdoUiGsLsz7w1uXjWQuur9FKMc8SuIFXg",
  authDomain: "composite-armor-7wx5p.firebaseapp.com",
  projectId: "composite-armor-7wx5p",
  storageBucket: "composite-armor-7wx5p.firebasestorage.app",
  messagingSenderId: "10552132731",
  appId: "1:10552132731:web:3d0a7b23f30454cb544ede"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID
export const db = getFirestore(app, "ai-studio-fe60e71d-fd50-42c6-9ffc-956139a6f4fa");

// --- FIRESTORE DIAGNOSTIC ERROR HANDLER ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {}, // Since no Firebase Auth is active on client, we leave it empty or default
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- FIREBASE HELPER METHODS ---

/**
 * Fetch portfolio data (profile, projects, skills).
 * If they do not exist yet, they will be seeded with defaults.
 */
export async function getPortfolioData(defaults: {
  profile: ProfileData;
  projects: ProjectData[];
  skills: SkillData[];
}) {
  const path = 'settings';
  try {
    const profileRef = doc(db, 'settings', 'profile');
    const projectsRef = doc(db, 'settings', 'projects');
    const skillsRef = doc(db, 'settings', 'skills');

    const [profileSnap, projectsSnap, skillsSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(projectsRef),
      getDoc(skillsRef)
    ]);

    let profile = defaults.profile;
    let projects = defaults.projects;
    let skills = defaults.skills;

    // Load or seed profile
    if (profileSnap.exists()) {
      profile = profileSnap.data().data as ProfileData;
      
      let migrated = false;

      // Auto-migrate name if it contains "Tariq Mansour" or "طارق منصور" to "Nada Hamad"
      if (profile.name && (profile.name.en === "Tariq Mansour" || profile.name.ar === "طارق منصور")) {
        profile.name = {
          ar: "ندا حمد",
          en: "Nada Hamad"
        };
        profile.title = {
          ar: "صحفية استقصائية ومعدة برامج إعلامية ورائدة محتوى",
          en: "Investigative Journalist, Media Producer & Content Creator"
        };
        migrated = true;
      }

      // Auto-migrate old metrics to include all four: Instagram, Gmail, WhatsApp, LinkedIn
      if (profile.metrics) {
        // Map old facebook to instagram
        profile.metrics = profile.metrics.map(m => {
          if (m.id === 'facebook') {
            migrated = true;
            return {
              id: "instagram",
              label: { ar: "إنستغرام", en: "Instagram" },
              value: "الحساب الرسمي",
              link: "https://instagram.com"
            };
          }
          return m;
        });

        // Ensure all required metrics are present
        const ids = profile.metrics.map(m => m.id);
        if (!ids.includes('instagram')) {
          profile.metrics.push({
            id: "instagram",
            label: { ar: "إنستغرام", en: "Instagram" },
            value: "الحساب الرسمي",
            link: "https://instagram.com"
          });
          migrated = true;
        }
        if (!ids.includes('gmail')) {
          profile.metrics.push({
            id: "gmail",
            label: { ar: "البريد الإلكتروني", en: "Gmail" },
            value: "israahamad124@gmail.com",
            link: "mailto:israahamad124@gmail.com"
          });
          migrated = true;
        }
        if (!ids.includes('whatsapp')) {
          profile.metrics.push({
            id: "whatsapp",
            label: { ar: "واتساب", en: "WhatsApp" },
            value: "تواصل مباشر",
            link: "https://wa.me/201000000000"
          });
          migrated = true;
        }
        if (!ids.includes('linkedin')) {
          profile.metrics.push({
            id: "linkedin",
            label: { ar: "لينكد إن", en: "LinkedIn" },
            value: "الملف المهني",
            link: "https://linkedin.com"
          });
          migrated = true;
        }

        // Filter out obsolete/unsupported ids just in case (like facebook)
        profile.metrics = profile.metrics.filter(m => m.id !== 'facebook');

        if (migrated) {
          try {
            await setDoc(profileRef, { data: profile });
            console.log("Successfully migrated profile name/metrics in Firestore to Nada Hamad with Instagram, Gmail, WhatsApp, and LinkedIn.");
          } catch (e) {
            console.error("Failed to auto-save migrated profile to Firestore:", e);
          }
        }
      }

      // Reconstruct CV if chunked to bypass Firestore 1MB document size limit
      if (profile.cvUrl === "db://chunked" && profile.cvChunksCount && profile.cvChunksCount > 0) {
        try {
          const chunkPromises = [];
          for (let i = 0; i < profile.cvChunksCount; i++) {
            chunkPromises.push(getDoc(doc(db, 'settings', `cv_chunk_${i}`)));
          }
          const chunkSnaps = await Promise.all(chunkPromises);
          let fullBase64 = "";
          for (const snap of chunkSnaps) {
            if (snap.exists()) {
              fullBase64 += snap.data().chunk || "";
            }
          }
          profile.cvUrl = fullBase64;
        } catch (e) {
          console.error("Failed to reconstruct chunked CV from Firestore:", e);
        }
      }
    } else {
      await setDoc(profileRef, { data: defaults.profile });
    }

    // Load or seed projects
    if (projectsSnap.exists()) {
      projects = projectsSnap.data().data as ProjectData[];
    } else {
      await setDoc(projectsRef, { data: defaults.projects });
    }

    // Load or seed skills
    if (skillsSnap.exists()) {
      skills = skillsSnap.data().data as SkillData[];
    } else {
      await setDoc(skillsRef, { data: defaults.skills });
    }

    return { profile, projects, skills };
  } catch (error) {
    console.error("Error fetching portfolio data from Firestore:", error);
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Save all settings (profile, projects, skills)
 */
export async function savePortfolioData(
  profile: ProfileData,
  projects: ProjectData[],
  skills: SkillData[]
) {
  const path = 'settings';
  try {
    const profileRef = doc(db, 'settings', 'profile');
    const projectsRef = doc(db, 'settings', 'projects');
    const skillsRef = doc(db, 'settings', 'skills');

    const processedProfile = { ...profile };

    if (processedProfile.cvUrl && processedProfile.cvUrl.startsWith('data:')) {
      const fullBase64 = processedProfile.cvUrl;
      const chunkSize = 700000; // ~700KB chunks (very safe under 1MB)
      const chunks: string[] = [];
      for (let i = 0; i < fullBase64.length; i += chunkSize) {
        chunks.push(fullBase64.substring(i, i + chunkSize));
      }

      // Write chunks
      const chunkPromises = chunks.map((chunk, index) => {
        return setDoc(doc(db, 'settings', `cv_chunk_${index}`), { chunk });
      });
      await Promise.all(chunkPromises);

      // Clean up any remaining older chunks
      const oldChunksCount = processedProfile.cvChunksCount || 0;
      if (oldChunksCount > chunks.length) {
        const cleanupPromises = [];
        for (let i = chunks.length; i < Math.max(oldChunksCount, 25); i++) {
          cleanupPromises.push(setDoc(doc(db, 'settings', `cv_chunk_${i}`), { chunk: "" }));
        }
        await Promise.all(cleanupPromises);
      }

      processedProfile.cvUrl = "db://chunked";
      processedProfile.cvChunksCount = chunks.length;
    } else if (processedProfile.cvUrl && !processedProfile.cvUrl.startsWith('db://')) {
      // It's a standard external link, clean up all chunks
      const oldChunksCount = processedProfile.cvChunksCount || 0;
      const cleanupPromises = [];
      for (let i = 0; i < Math.max(oldChunksCount, 25); i++) {
        cleanupPromises.push(setDoc(doc(db, 'settings', `cv_chunk_${i}`), { chunk: "" }));
      }
      await Promise.all(cleanupPromises);
      processedProfile.cvChunksCount = 0;
    } else if (!processedProfile.cvUrl) {
      // Clear all chunks
      const oldChunksCount = processedProfile.cvChunksCount || 0;
      const cleanupPromises = [];
      for (let i = 0; i < Math.max(oldChunksCount, 25); i++) {
        cleanupPromises.push(setDoc(doc(db, 'settings', `cv_chunk_${i}`), { chunk: "" }));
      }
      await Promise.all(cleanupPromises);
      processedProfile.cvChunksCount = 0;
    }

    await Promise.all([
      setDoc(profileRef, { data: processedProfile }),
      setDoc(projectsRef, { data: projects }),
      setDoc(skillsRef, { data: skills })
    ]);
    return true;
  } catch (error) {
    console.error("Error saving portfolio data to Firestore:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Fetch all contact messages
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  const path = 'messages';
  try {
    const messagesCol = collection(db, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const messages: ContactMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as ContactMessage);
    });
    return messages;
  } catch (error) {
    console.error("Error fetching messages from Firestore:", error);
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Send a contact message
 */
export async function sendContactMessage(msg: Omit<ContactMessage, 'id'>) {
  const path = 'messages';
  try {
    const messagesCol = collection(db, 'messages');
    const docRef = await addDoc(messagesCol, msg);
    return docRef.id;
  } catch (error) {
    console.error("Error sending message to Firestore:", error);
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Update message status (read/unread) or delete
 */
export async function saveAllMessages(messages: ContactMessage[]) {
  try {
    // Left for potential synchronization or compatibility
  } catch (error) {
    console.error("Error syncing messages:", error);
  }
}

export async function deleteMessageFromFirestore(id: string) {
  const path = `messages/${id}`;
  try {
    const msgRef = doc(db, 'messages', id);
    await deleteDoc(msgRef);
  } catch (error) {
    console.error("Error deleting message from Firestore:", error);
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function updateMessageReadStatus(id: string, isRead: boolean) {
  const path = `messages/${id}`;
  try {
    const msgRef = doc(db, 'messages', id);
    await setDoc(msgRef, { isRead }, { merge: true });
  } catch (error) {
    console.error("Error updating read status in Firestore:", error);
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

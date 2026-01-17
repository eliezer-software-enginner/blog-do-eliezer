import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateVagasPost() {
  try {
    console.log('🔍 Buscando post "Vagas sendo canceladas" na coleção posts...');
    
    // Buscar o post na coleção antiga
    const oldCollection = 'posts';
    const newCollection = 'apps/meu-blog/posts';
    const postId = 'lsq0qXoDXUPyDCMtJ96C';
    
    const oldDocRef = doc(db, oldCollection, postId);
    const oldDocSnap = await getDoc(oldDocRef);
    
    if (!oldDocSnap.exists()) {
      console.log('❌ Post não encontrado na coleção antiga');
      return;
    }
    
    const postData = oldDocSnap.data();
    console.log('✅ Post encontrado:', postData.title);
    
    // Criar na nova coleção
    const newDocRef = doc(db, newCollection, postId);
    await setDoc(newDocRef, postData);
    console.log('✅ Post copiado para a nova coleção');
    
    // Verificar se foi copiado corretamente
    const newDocSnap = await getDoc(newDocRef);
    if (newDocSnap.exists()) {
      console.log('✅ Verificação: Post existe na nova coleção');
      
      // Opcional: remover da coleção antiga (comentado por segurança)
      // await deleteDoc(oldDocRef);
      // console.log('✅ Post removido da coleção antiga');
      console.log('⚠️  Post mantido na coleção antiga (remova manualmente se desejar)');
      
    } else {
      console.log('❌ Erro: Post não foi copiado corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

migrateVagasPost().then(() => process.exit(0));

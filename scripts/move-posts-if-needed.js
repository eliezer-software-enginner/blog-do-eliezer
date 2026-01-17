// Script para mover posts da coleção "posts" para "apps/meu-blog/posts"
// Uso: node scripts/move-posts-if-needed.js

import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function movePostsIfNeeded() {
  try {
    console.log('🔍 Verificando se há posts para mover...\n');
    
    // Verificar coleção antiga
    const oldCollection = collection(db, 'posts');
    const oldSnapshot = await getDocs(oldCollection);
    
    if (oldSnapshot.empty) {
      console.log('✅ Nenhum post encontrado na coleção "posts"');
      console.log('   Todos os posts já estão na coleção correta.');
      return;
    }
    
    console.log(`📋 Encontrados ${oldSnapshot.size} posts na coleção "posts":`);
    
    let foundTargetPost = false;
    oldSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.title || 'Sem título'}`);
      
      if (data.title?.toLowerCase().includes('vagas sendo canceladas')) {
        foundTargetPost = true;
        console.log(`    🎯 POST "Vagas sendo canceladas" ENCONTRADO!`);
      }
    });
    
    // Mover posts
    const newCollection = collection(db, 'apps/meu-blog/posts');
    let movedCount = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Movendo posts para a coleção correta...');
    
    for (const oldDoc of oldSnapshot.docs) {
      const postData = oldDoc.data();
      const docId = oldDoc.id;
      const title = postData.title || 'Sem título';
      
      try {
        // Copiar para nova coleção
        await setDoc(doc(newCollection, docId), postData);
        
        // Deletar da coleção antiga
        await deleteDoc(oldDoc.ref);
        
        movedCount++;
        console.log(`✅ Movido: ${title}`);
        
        if (title.toLowerCase().includes('vagas sendo canceladas')) {
          console.log(`🎯 POST ALVO MOVIDO COM SUCESSO!`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao mover ${title}:`, error);
        errorCount++;
      }
    }
    
    // Verificação final
    console.log(`\n📊 RESULTADO:`);
    console.log(`  - Posts movidos: ${movedCount}`);
    console.log(`  - Erros: ${errorCount}`);
    
    if (foundTargetPost && movedCount > 0) {
      console.log(`🎯 Post "Vagas sendo canceladas" foi movido para apps/meu-blog/posts`);
    }
    
    const finalOldSnapshot = await getDocs(oldCollection);
    if (finalOldSnapshot.size === 0) {
      console.log(`✅ Todos os posts foram movidos com sucesso!`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante movimentação:', error);
  }
}

// Executar script
movePostsIfNeeded().then(() => {
  console.log('\n🏁 Script concluído');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script falhou:', error);
  process.exit(1);
});
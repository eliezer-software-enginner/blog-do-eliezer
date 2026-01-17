import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
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

async function checkAllCollections() {
  try {
    console.log('🔍 Verificando posts em ambas as coleções...\n');
    
    // 1. Verificar coleção antiga 'posts'
    console.log('📂 Verificando coleção "posts"...');
    const oldCollection = collection(db, 'posts');
    const oldSnapshot = await getDocs(oldCollection);
    
    if (oldSnapshot.empty) {
      console.log('✅ Coleção "posts" está vazia');
    } else {
      console.log(`📋 Encontrados ${oldSnapshot.size} posts na coleção "posts":`);
      oldSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.title || 'Sem título'}`);
        if (data.title?.toLowerCase().includes('vagas sendo canceladas')) {
          console.log(`    🎯 POST ALVO ENCONTRADO AQUI!`);
        }
      });
    }
    
    // 2. Verificar coleção correta 'apps/meu-blog/posts'
    console.log('\n📂 Verificando coleção "apps/meu-blog/posts"...');
    const newCollection = collection(db, 'apps/meu-blog/posts');
    const newSnapshot = await getDocs(newCollection);
    
    if (newSnapshot.empty) {
      console.log('❌ Coleção "apps/meu-blog/posts" está vazia');
    } else {
      console.log(`📋 Encontrados ${newSnapshot.size} posts na coleção correta:`);
      newSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.title || 'Sem título'}`);
        if (data.title?.toLowerCase().includes('vagas sendo canceladas')) {
          console.log(`    🎯 POST ALVO ENCONTRADO AQUI!`);
        }
      });
    }
    
    // 3. Buscar especificamente pelo post "Vagas sendo canceladas"
    console.log('\n🔍 Buscando especificamente por "Vagas sendo canceladas"...');
    
    let foundInOld = false;
    let foundInNew = false;
    
    // Buscar na coleção antiga
    const oldVagasQuery = query(oldCollection, where('title', '>=', 'vagas'), where('title', '<=', 'vagas\uf8ff'));
    const oldVagasSnapshot = await getDocs(oldVagasQuery);
    oldVagasSnapshot.docs.forEach((doc) => {
      if (doc.data().title?.toLowerCase().includes('vagas sendo canceladas')) {
        foundInOld = true;
        console.log(`🎯 Encontrado na coleção "posts": ${doc.id} - ${doc.data().title}`);
      }
    });
    
    // Buscar na coleção nova
    const newVagasQuery = query(newCollection, where('title', '>=', 'vagas'), where('title', '<=', 'vagas\uf8ff'));
    const newVagasSnapshot = await getDocs(newVagasQuery);
    newVagasSnapshot.docs.forEach((doc) => {
      if (doc.data().title?.toLowerCase().includes('vagas sendo canceladas')) {
        foundInNew = true;
        console.log(`🎯 Encontrado na coleção "apps/meu-blog/posts": ${doc.id} - ${doc.data().title}`);
      }
    });
    
    if (!foundInOld && !foundInNew) {
      console.log('❌ Post "Vagas sendo canceladas" não encontrado em nenhuma coleção');
    }
    
    // 4. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`  - Posts na coleção "posts" (errada): ${oldSnapshot.size}`);
    console.log(`  - Posts na coleção "apps/meu-blog/posts" (correta): ${newSnapshot.size}`);
    
    if (oldSnapshot.size > 0) {
      console.log('\n⚠️  AÇÃO NECESSÁRIA: Mover posts da coleção "posts" para "apps/meu-blog/posts"');
    } else if (newSnapshot.size > 0) {
      console.log('\n✅ Posts já estão na coleção correta');
    } else {
      console.log('\n❌ Nenhum post encontrado em nenhuma coleção');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar coleções:', error);
  }
}

checkAllCollections().then(() => {
  console.log('\n🏁 Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Falha na verificação:', error);
  process.exit(1);
});
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
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

async function moveAllPostsToCorrectCollection() {
  try {
    console.log('🔍 INICIANDO MIGRAÇÃO DE POSTS...\n');
    
    // 1. Verificar posts na coleção antiga
    console.log('📂 Buscando posts na coleção "posts"...');
    const oldCollection = collection(db, 'posts');
    const oldSnapshot = await getDocs(oldCollection);
    
    if (oldSnapshot.empty) {
      console.log('✅ Nenhum post encontrado na coleção "posts"');
      
      // Verificar se posts já estão na coleção correta
      console.log('\n📂 Verificando se posts já estão na coleção correta...');
      const newCollection = collection(db, 'apps/meu-blog/posts');
      const newSnapshot = await getDocs(newCollection);
      
      if (newSnapshot.empty) {
        console.log('❌ Nenhum post encontrado em nenhuma coleção');
      } else {
        console.log(`✅ Encontrados ${newSnapshot.size} posts na coleção correta`);
        
        // Procurar pelo post "Vagas sendo canceladas"
        const targetPost = newSnapshot.docs.find(doc => 
          doc.data().title?.toLowerCase().includes('vagas sendo canceladas')
        );
        
        if (targetPost) {
          console.log(`🎯 Post "Vagas sendo canceladas" encontrado na coleção correta!`);
          console.log(`   ID: ${targetPost.id}`);
          console.log(`   Título: ${targetPost.data().title}`);
        } else {
          console.log(`❌ Post "Vagas sendo canceladas" não encontrado`);
        }
      }
      return;
    }
    
    console.log(`📋 Encontrados ${oldSnapshot.size} posts para mover:`);
    oldSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.title || 'Sem título'}`);
      if (data.title?.toLowerCase().includes('vagas sendo canceladas')) {
        console.log(`    🎯 POST ALVO ENCONTRADO!`);
      }
    });
    
    // 2. Mover para coleção correta
    const newCollection = collection(db, 'apps/meu-blog/posts');
    let movedCount = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Iniciando movimentação...');
    
    for (const oldDoc of oldSnapshot.docs) {
      const postData = oldDoc.data();
      const docId = oldDoc.id;
      const title = postData.title || 'Sem título';
      
      console.log(`\n📝 Processando: ${title} (${docId})`);
      
      try {
        // Verificar se já existe na coleção correta
        const newDocRef = doc(newCollection, docId);
        
        // Copiar para a coleção correta mantendo o mesmo ID e todos os dados
        await setDoc(newDocRef, postData);
        console.log(`✅ Copiado para apps/meu-blog/posts`);
        
        // Deletar da coleção antiga
        await deleteDoc(oldDoc.ref);
        console.log(`🗑️  Removido de "posts"`);
        
        movedCount++;
        
        if (title.toLowerCase().includes('vagas sendo canceladas')) {
          console.log(`🎯 POST ALVO MOVIDO COM SUCESSO!`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao mover post ${docId}:`, error);
        errorCount++;
      }
    }
    
    // 3. Verificação final
    console.log(`\n📊 RESUMO DA OPERAÇÃO:`);
    console.log(`  - Posts movidos com sucesso: ${movedCount}`);
    console.log(`  - Posts com erro: ${errorCount}`);
    console.log(`  - Total processado: ${oldSnapshot.size}`);
    
    // Verificar se tudo foi movido corretamente
    console.log(`\n🔍 VERIFICAÇÃO FINAL...`);
    const finalOldSnapshot = await getDocs(oldCollection);
    const finalNewSnapshot = await getDocs(newCollection);
    
    console.log(`  - Posts restantes na coleção "posts": ${finalOldSnapshot.size}`);
    console.log(`  - Posts na coleção "apps/meu-blog/posts": ${finalNewSnapshot.size}`);
    
    // Procurar pelo post alvo
    const targetPost = finalNewSnapshot.docs.find(doc => 
      doc.data().title?.toLowerCase().includes('vagas sendo canceladas')
    );
    
    if (targetPost) {
      console.log(`\n🎯 SUCESSO: Post "Vagas sendo canceladas" encontrado na coleção correta!`);
      console.log(`   ID: ${targetPost.id}`);
      console.log(`   Título: ${targetPost.data().title}`);
      console.log(`   Slug: ${targetPost.data().slug}`);
      console.log(`   Data: ${targetPost.data().createdAt?.toDate()}`);
    } else {
      console.log(`\n❌ Post "Vagas sendo canceladas" não encontrado após migração`);
    }
    
    if (finalOldSnapshot.size === 0 && movedCount > 0) {
      console.log(`\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!`);
      console.log(`   Todos os posts foram movidos para a coleção correta.`);
    } else if (finalOldSnapshot.size > 0) {
      console.log(`\n⚠️  ATENÇÃO: Ainda existem posts na coleção antiga.`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

// Executar script
moveAllPostsToCorrectCollection().then(() => {
  console.log('\n🏁 Script concluído');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script falhou:', error);
  process.exit(1);
});
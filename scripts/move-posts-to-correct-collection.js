import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
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

async function movePostsToCorrectCollection() {
  try {
    console.log('🔍 Verificando posts na coleção errada "posts"...');
    
    // 1. Verificar posts na coleção errada
    const wrongCollection = collection(db, 'posts');
    const wrongSnapshot = await getDocs(wrongCollection);
    
    if (wrongSnapshot.empty) {
      console.log('✅ Nenhum post encontrado na coleção errada "posts"');
      return;
    }
    
    console.log(`📋 Encontrados ${wrongSnapshot.size} posts na coleção errada:`);
    wrongSnapshot.docs.forEach((doc) => {
      console.log(`  - ${doc.id}: ${doc.data().title || 'Sem título'}`);
    });
    
    // 2. Mover posts para a coleção correta
    const correctCollection = collection(db, 'apps/meu-blog/posts');
    let movedCount = 0;
    let skippedCount = 0;
    
    for (const wrongDoc of wrongSnapshot.docs) {
      const postData = wrongDoc.data();
      const docId = wrongDoc.id;
      
      console.log(`\n🔄 Processando post: ${postData.title || 'Sem título'} (${docId})`);
      
      try {
        // Verificar se já existe na coleção correta
        const correctDocRef = doc(correctCollection, docId);
        const correctDocSnapshot = await getDocs(query(correctCollection, where('__name__', '==', docId)));
        
        if (!correctDocSnapshot.empty) {
          console.log(`⚠️  Post já existe na coleção correta. Pulando...`);
          skippedCount++;
          continue;
        }
        
        // Copiar para a coleção correta mantendo o mesmo ID
        await setDoc(correctDocRef, postData);
        console.log(`✅ Post movido para apps/meu-blog/posts`);
        
        // Deletar da coleção errada
        await deleteDoc(wrongDoc.ref);
        console.log(`🗑️  Post removido da coleção "posts"`);
        
        movedCount++;
        
      } catch (moveError) {
        console.error(`❌ Erro ao mover post ${docId}:`, moveError);
      }
    }
    
    console.log(`\n📊 Resumo da operação:`);
    console.log(`  - Posts movidos: ${movedCount}`);
    console.log(`  - Posts pulados (já existiam): ${skippedCount}`);
    console.log(`  - Total processado: ${wrongSnapshot.size}`);
    
    // 3. Verificar resultado final
    console.log(`\n🔍 Verificando posts na coleção correta "apps/meu-blog/posts"...`);
    const correctSnapshot = await getDocs(query(correctCollection, orderBy('createdAt', 'desc')));
    console.log(`📝 Total de posts na coleção correta: ${correctSnapshot.size}`);
    
    // Procurar especificamente pelo post "Vagas sendo canceladas"
    const targetPost = correctSnapshot.docs.find(doc => 
      doc.data().title?.toLowerCase().includes('vagas sendo canceladas')
    );
    
    if (targetPost) {
      console.log(`🎯 Post "Vagas sendo canceladas" encontrado na coleção correta!`);
      console.log(`   ID: ${targetPost.id}`);
      console.log(`   Título: ${targetPost.data().title}`);
    } else {
      console.log(`❌ Post "Vagas sendo canceladas" não encontrado na coleção correta`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a movimentação:', error);
  }
}

// Executar script
movePostsToCorrectCollection().then(() => {
  console.log('\n🏁 Script concluído');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script falhou:', error);
  process.exit(1);
});
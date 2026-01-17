import { collection, getDocs, query, where } from 'firebase/firestore';
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

async function listAllPosts() {
  try {
    console.log('Buscando todos os posts...');
    
    const postsCollection = collection(db, 'apps/meu-blog/posts');
    const postsSnapshot = await getDocs(postsCollection);
    
    if (postsSnapshot.empty) {
      console.log('Nenhum post encontrado.');
      return;
    }

    console.log(`\n📝 Total de posts encontrados: ${postsSnapshot.size}\n`);
    console.log('=' .repeat(80));
    
    let foundTargetPost = false;
    
    postsSnapshot.docs.forEach((doc) => {
      const postData = doc.data();
      const title = postData.title || 'Sem título';
      const slug = postData.slug || 'Sem slug';
      const createdAt = postData.createdAt;
      const date = createdAt?.toDate ? createdAt.toDate() : createdAt;
      
      console.log(`ID: ${doc.id}`);
      console.log(`Título: ${title}`);
      console.log(`Slug: ${slug}`);
      console.log(`Data: ${date}`);
      console.log(`Autor: ${postData.authorName || 'Sem autor'}`);
      console.log(`Conteúdo: ${postData.content?.substring(0, 100)}...`);
      console.log('-'.repeat(80));
      
      // Verificar se é o post que estamos procurando
      if (title.toLowerCase().includes('vagas sendo canceladas')) {
        console.log('🎯 POST ENCONTRADO: "Vagas sendo canceladas"');
        console.log('Dados completos:', JSON.stringify(postData, null, 2));
        foundTargetPost = true;
      }
    });
    
    if (!foundTargetPost) {
      console.log('\n❌ Post "Vagas sendo canceladas" não foi encontrado.');
    }
    
    // Buscar especificamente por posts com "vagas" no título
    console.log('\n🔍 Buscando posts que contenham "vagas" no título...');
    const vagasQuery = query(postsCollection, where('title', '>=', 'vagas'), where('title', '<=', 'vagas\uf8ff'));
    const vagasSnapshot = await getDocs(vagasQuery);
    
    if (vagasSnapshot.empty) {
      console.log('Nenhum post encontrado com "vagas" no título.');
    } else {
      console.log(`Found ${vagasSnapshot.size} posts com "vagas":`);
      vagasSnapshot.docs.forEach((doc) => {
        console.log(`- ${doc.data().title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar posts:', error);
  }
}

listAllPosts().then(() => process.exit(0));

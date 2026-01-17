// Verificar se post específico existe
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Configuração Firebase (mesma do projeto)
const firebaseConfig = {
  // Você precisará adicionar sua config aqui ou usar variáveis de ambiente
};

const app = initializeApp(firebaseConfig);
const serverDb = getFirestore(app);

async function checkPost() {
  try {
    console.log('🔍 Procurando por: "Vagas sendo canceladas"');
    
    // Buscar em ambas as coleções
    const collections = ['posts', 'apps/meu-blog/posts'];
    
    for (const collPath of collections) {
      console.log(`\n📂 Verificando coleção: ${collPath}`);
      
      const postsQuery = query(
        collection(serverDb, collPath),
        where('title', '==', 'Vagas sendo canceladas')
      );
      
      const snapshot = await getDocs(postsQuery);
      
      if (!snapshot.empty) {
        console.log('✅ Post encontrado!');
        snapshot.forEach(doc => {
          console.log(`ID: ${doc.id}`);
          console.log('Dados:', doc.data());
        });
      } else {
        console.log('❌ Post não encontrado nesta coleção');
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkPost();
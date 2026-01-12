#!/usr/bin/env node

// Script para migrar dados de 'posts' para 'apps/meu-blog/posts'
// e 'users' para 'apps/meu-blog/users'
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, doc, getDoc, writeBatch } = require('firebase/firestore');

// Carregar configuração do Firebase do .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Verificar se as credenciais estão carregadas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Credenciais do Firebase não encontradas!');
  console.error('Verifique se o arquivo .env.local existe e contém as variáveis NEXT_PUBLIC_FIREBASE_*');
  process.exit(1);
}

// Função para gerar slugs (se necessário)
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Função principal de migração
async function migrateCollections() {
  try {
    console.log('🚀 Iniciando migração de coleções...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Coleções antigas e novas
    const oldPostsCollection = collection(db, 'posts');
    const newPostsCollection = collection(db, 'apps/meu-blog/posts');
    const oldUsersCollection = collection(db, 'users');
    const newUsersCollection = collection(db, 'apps/meu-blog/users');
    
    let postsMigrated = 0;
    let usersMigrated = 0;
    
    // Migrar posts
    console.log('📝 Migrando posts...');
    const postsSnapshot = await getDocs(oldPostsCollection);
    
    if (!postsSnapshot.empty) {
      for (const docSnapshot of postsSnapshot.docs) {
        const postData = docSnapshot.data();
        
        // Adicionar slug se não existir
        if (!postData.slug) {
          postData.slug = generateSlug(postData.title);
        }
        
        // Adicionar timestamp de migração
        postData.migratedAt = new Date();
        
        // Criar novo documento
        await addDoc(newPostsCollection, postData);
        
        console.log(`✅ Post migrado: "${postData.title}"`);
        console.log(`   📗 Novo slug: ${postData.slug}`);
        postsMigrated++;
      }
    } else {
      console.log('📝 Nenhum post encontrado para migrar');
    }
    
    // Migrar usuários (se existirem)
    console.log('👤 Migrando usuários...');
    try {
      const usersSnapshot = await getDocs(oldUsersCollection);
      
      if (!usersSnapshot.empty) {
        for (const docSnapshot of usersSnapshot.docs) {
          const userData = docSnapshot.data();
          
          // Adicionar timestamp de migração
          userData.migratedAt = new Date();
          
          // Criar novo documento
          await addDoc(newUsersCollection, userData);
          
          console.log(`✅ Usuário migrado: ${userData.displayName || userData.email || 'Unknown'}`);
          usersMigrated++;
        }
      } else {
        console.log('👤 Nenhum usuário encontrado para migrar');
      }
    } catch (error) {
      console.log('👤 Coleção "users" não existe ou está vazia');
    }
    
    console.log(`\n🎉 Migração concluída com sucesso!`);
    console.log(`📝 Posts migrados: ${postsMigrated}`);
    console.log(`👤 Usuários migrados: ${usersMigrated}`);
    console.log(`\n📂 Nova estrutura:`);
    console.log(`   Posts: apps/meu-blog/posts`);
    console.log(`   Usuários: apps/meu-blog/users`);
    console.log(`\n⚠️  Verifique se os dados foram migrados corretamente antes de excluir as coleções antigas!`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Função para verificar migração
async function verifyMigration() {
  try {
    console.log('🔍 Verificando migração...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const newPostsCollection = collection(db, 'apps/meu-blog/posts');
    const newUsersCollection = collection(db, 'apps/meu-blog/users');
    
    const postsSnapshot = await getDocs(newPostsCollection);
    const usersSnapshot = await getDocs(newUsersCollection);
    
    console.log(`✅ Posts na nova coleção: ${postsSnapshot.size}`);
    console.log(`✅ Usuários na nova coleção: ${usersSnapshot.size}`);
    
    if (postsSnapshot.size > 0) {
      console.log('\n📋 Posts migrados:');
      postsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.title} (${data.slug})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar migração e verificação
async function runMigration() {
  await migrateCollections();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Pequena pausa
  await verifyMigration();
  
  console.log('\n✨ Processo finalizado!');
  console.log('🔄 Seus dados foram migrados para a nova estrutura "apps/meu-blog/"');
}

// Executar
runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });
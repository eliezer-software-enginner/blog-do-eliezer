#!/usr/bin/env node

// Script para limpar coleções antigas (OPCIONAL)
// Execute APENAS depois de verificar que a migração foi bem-sucedida
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

// Função para limpar coleções antigas
async function cleanOldCollections() {
  console.log('🧹 AVISO: Este script irá EXCLUIR as coleções antigas!');
  console.log('⚠️  Certifique-se de que a migração foi bem-sucedida antes de continuar!');
  
  // Simular confirmação (remova este bloco em ambiente real)
  console.log('\n❗ Para executar realmente a limpeza, comente a linha abaixo:');
  console.log('return; // Comente esta linha para permitir exclusão');
  return;
  
  try {
    console.log('🚀 Iniciando limpeza de coleções antigas...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    let deletedPosts = 0;
    let deletedUsers = 0;
    
    // Limpar posts antigos
    console.log('🗑️  Limpando posts antigos...');
    const oldPostsCollection = collection(db, 'posts');
    const postsSnapshot = await getDocs(oldPostsCollection);
    
    if (!postsSnapshot.empty) {
      for (const docSnapshot of postsSnapshot.docs) {
        await deleteDoc(doc(db, 'posts', docSnapshot.id));
        deletedPosts++;
        console.log(`🗑️  Post excluído: ${docSnapshot.id}`);
      }
    } else {
      console.log('📝 Nenhum post antigo encontrado');
    }
    
    // Limpar usuários antigos
    console.log('👤 Limpando usuários antigos...');
    try {
      const oldUsersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(oldUsersCollection);
      
      if (!usersSnapshot.empty) {
        for (const docSnapshot of usersSnapshot.docs) {
          await deleteDoc(doc(db, 'users', docSnapshot.id));
          deletedUsers++;
          console.log(`👤 Usuário excluído: ${docSnapshot.id}`);
        }
      } else {
        console.log('👤 Nenhum usuário antigo encontrado');
      }
    } catch (error) {
      console.log('👤 Coleção "users" não existe');
    }
    
    console.log(`\n🎉 Limpeza concluída!`);
    console.log(`🗑️  Posts excluídos: ${deletedPosts}`);
    console.log(`👤 Usuários excluídos: ${deletedUsers}`);
    console.log(`\n✅ Apenas a nova estrutura "apps/meu-blog/" permanece!`);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

// Função para verificar estado atual
async function checkCurrentState() {
  try {
    console.log('🔍 Verificando estado atual das coleções...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Verificar coleções antigas
    const oldPostsCollection = collection(db, 'posts');
    const oldUsersCollection = collection(db, 'users');
    
    // Verificar coleções novas
    const newPostsCollection = collection(db, 'apps/meu-blog/posts');
    const newUsersCollection = collection(db, 'apps/meu-blog/users');
    
    const oldPosts = await getDocs(oldPostsCollection);
    const oldUsers = await getDocs(oldUsersCollection);
    const newPosts = await getDocs(newPostsCollection);
    const newUsers = await getDocs(newUsersCollection);
    
    console.log('\n📊 Estado atual:');
    console.log(`📝 Posts antigos: ${oldPosts.size}`);
    console.log(`👤 Usuários antigos: ${oldUsers.size}`);
    console.log(`📝 Posts novos: ${newPosts.size}`);
    console.log(`👤 Usuários novos: ${newUsers.size}`);
    
    if (oldPosts.size === 0 && oldUsers.size === 0) {
      console.log('\n✅ Coleções antigas já foram limpas!');
    } else if (newPosts.size > 0) {
      console.log('\n✅ Migração parece ter sido bem-sucedida!');
      console.log('🧹 Você pode executar a limpeza das coleções antigas com segurança.');
    } else {
      console.log('\n⚠️  Migração pode não ter sido concluída!');
      console.log('❗ Não execute a limpeza ainda!');
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar verificação
if (process.argv.includes('--check')) {
  await checkCurrentState();
} else {
  await cleanOldCollections();
}
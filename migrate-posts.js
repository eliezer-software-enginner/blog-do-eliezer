#!/usr/bin/env node

// Script de migração direto - execute com: node migrate-posts.js
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

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

// Função para gerar slugs
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove múltiplos hífens
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
}

// Função para gerar slug único
function generateUniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Função principal de migração
async function migratePosts() {
  try {
    console.log('🚀 Iniciando migração de posts...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Buscar todos os posts
    const postsCollection = collection(db, 'apps/meu-blog/posts');
    const postsSnapshot = await getDocs(postsCollection);
    
    if (postsSnapshot.empty) {
      console.log('❌ Nenhum post encontrado para migrar.');
      return;
    }

    // Obter todos os slugs existentes
    const allPostsSnapshot = await getDocs(postsCollection);
    const existingSlugs = allPostsSnapshot.docs
      .map(doc => doc.data().slug)
      .filter(Boolean);

    console.log(`📊 Encontrados ${postsSnapshot.size} posts no total`);
    console.log(`🔗 Slugs existentes: ${existingSlugs.length}`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Atualizar cada post sem slug
    for (const docSnapshot of postsSnapshot.docs) {
      const postData = docSnapshot.data();
      
      // Pular se já tiver slug
      if (postData.slug) {
        console.log(`⏭️  Post "${postData.title}" já tem slug: ${postData.slug}`);
        skippedCount++;
        continue;
      }

      // Gerar slug único
      const baseSlug = generateSlug(postData.title);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      // Adicionar à lista de slugs existentes
      existingSlugs.push(uniqueSlug);

      // Atualizar o documento
      await updateDoc(doc(db, 'apps/meu-blog/posts', docSnapshot.id), {
        slug: uniqueSlug
      });

      console.log(`✅ Post "${postData.title}" migrado com slug: ${uniqueSlug}`);
      console.log(`   📝 URL: https://blog-do-eliezer.vercel.app/post/${uniqueSlug}`);
      migratedCount++;
    }

    console.log(`\n🎉 Migração concluída com sucesso!`);
    console.log(`📈 Posts migrados: ${migratedCount}`);
    console.log(`⏭️  Posts pulados (já tinham slug): ${skippedCount}`);
    console.log(`\n🌐 Todos os posts agora têm URLs amigáveis!`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar migração
migratePosts()
  .then(() => {
    console.log('\n✨ Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });
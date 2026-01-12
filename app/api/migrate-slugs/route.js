// /app/api/migrate-slugs/route.js
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { serverDb } from '@/lib/firebase-server';
import { generateSlug, generateUniqueSlug } from '@/lib/slug';
import { FIREBASE_COLLECTIONS } from '@/lib/collections';

export async function POST(request) {
  try {
    console.log('Iniciando migração de posts via API...');
    
    // Buscar todos os posts
    const postsCollection = collection(serverDb, FIREBASE_COLLECTIONS.POSTS);
    const postsSnapshot = await getDocs(postsCollection);
    
    if (postsSnapshot.empty) {
      return Response.json({
        success: true,
        message: 'Nenhum post encontrado para migrar.',
        migrated: 0,
        skipped: 0
      });
    }

    // Obter todos os slugs existentes
    const allPostsSnapshot = await getDocs(postsCollection);
    const existingSlugs = allPostsSnapshot.docs
      .map(doc => doc.data().slug)
      .filter(Boolean);

    let migratedCount = 0;
    let skippedCount = 0;
    const migrationLog = [];

    // Atualizar cada post sem slug
    for (const docSnapshot of postsSnapshot.docs) {
      const postData = docSnapshot.data();
      
      // Pular se já tiver slug
      if (postData.slug) {
        migrationLog.push({
          title: postData.title,
          status: 'skipped',
          reason: 'Já tem slug',
          slug: postData.slug
        });
        skippedCount++;
        continue;
      }

      // Gerar slug único
      const baseSlug = generateSlug(postData.title);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      // Adicionar à lista de slugs existentes
      existingSlugs.push(uniqueSlug);

      // Atualizar o documento
      await updateDoc(doc(serverDb, FIREBASE_COLLECTIONS.POSTS, docSnapshot.id), {
        slug: uniqueSlug
      });

      migrationLog.push({
        title: postData.title,
        status: 'migrated',
        oldId: docSnapshot.id,
        newSlug: uniqueSlug
      });

      console.log(`✅ Post "${postData.title}" migrado com slug: ${uniqueSlug}`);
      migratedCount++;
    }

    const result = {
      success: true,
      message: 'Migração concluída com sucesso!',
      migrated: migratedCount,
      skipped: skippedCount,
      total: postsSnapshot.size,
      log: migrationLog
    };

    console.log(`✨ Migração concluída! Migrados: ${migratedCount}, Pulados: ${skippedCount}`);
    
    return Response.json(result);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    
    return Response.json({
      success: false,
      error: error.message,
      message: 'Ocorreu um erro durante a migração'
    }, { status: 500 });
  }
}
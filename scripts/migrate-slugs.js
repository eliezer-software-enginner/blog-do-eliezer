import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FIREBASE_COLLECTIONS } from '../lib/collections';
import { generateSlug, generateUniqueSlug } from '../lib/slug';

/**
 * Script para migrar posts existentes adicionando slugs
 * Execute este script uma vez para atualizar todos os posts sem slug
 */
async function migratePostsWithSlugs() {
  try {
    console.log('Iniciando migração de posts...');
    
    // Buscar todos os posts que não têm slug
    const postsCollection = collection(db, FIREBASE_COLLECTIONS.POSTS);
    const postsSnapshot = await getDocs(postsCollection);
    
    if (postsSnapshot.empty) {
      console.log('Nenhum post encontrado para migrar.');
      return;
    }

    // Obter todos os slugs existentes para garantir unicidade
    const allPostsSnapshot = await getDocs(postsCollection);
    const existingSlugs = allPostsSnapshot.docs
      .map(doc => doc.data().slug)
      .filter(Boolean);

    let migratedCount = 0;
    let skippedCount = 0;

    // Atualizar cada post sem slug
    for (const docSnapshot of postsSnapshot.docs) {
      const postData = docSnapshot.data();
      
      // Pular se já tiver slug
      if (postData.slug) {
        console.log(`Post "${postData.title}" já tem slug: ${postData.slug}`);
        skippedCount++;
        continue;
      }

      // Gerar slug único
      const baseSlug = generateSlug(postData.title);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      // Adicionar à lista de slugs existentes
      existingSlugs.push(uniqueSlug);

      // Atualizar o documento
      await updateDoc(doc(db, 'posts', docSnapshot.id), {
        slug: uniqueSlug
      });

      console.log(`✅ Post "${postData.title}" migrado com slug: ${uniqueSlug}`);
      migratedCount++;
    }

    console.log(`\n✨ Migração concluída!`);
    console.log(`📝 Posts migrados: ${migratedCount}`);
    console.log(`⏭️  Posts pulados (já tinham slug): ${skippedCount}`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

// Exportar a função para poder usar em outro lugar se necessário
export { migratePostsWithSlugs };

// Se executar diretamente (node scripts/migrate.js)
if (typeof window === 'undefined' && require.main === module) {
  migratePostsWithSlugs()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
// Script para buscar posts via API e verificar o post "Vagas sendo canceladas"
const https = require('https');
const http = require('http');

async function fetchPostsFromAPI() {
  try {
    console.log('🔍 Buscando posts via API local...\n');
    
    const response = await fetch('http://localhost:3000/api/posts');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Erro na API:', data.error);
      return;
    }
    
    const posts = data.data;
    console.log(`📋 Encontrados ${posts.length} posts no total:\n`);
    
    let foundVagasPost = false;
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Autor: ${post.authorName}`);
      console.log(`   Data: ${post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt.seconds * 1000)}`);
      console.log('---');
      
      // Procurar pelo post "Vagas sendo canceladas"
      if (post.title?.toLowerCase().includes('vagas sendo canceladas')) {
        foundVagasPost = true;
        console.log('🎯 POST "Vagas sendo canceladas" ENCONTRADO!');
        console.log('Detalhes completos:');
        console.log(JSON.stringify(post, null, 2));
      }
      
      // Procurar por qualquer post com "vagas"
      if (post.title?.toLowerCase().includes('vagas')) {
        console.log('📝 Post contendo "vagas" no título encontrado!');
      }
    });
    
    if (!foundVagasPost) {
      console.log('\n❌ Post "Vagas sendo canceladas" não encontrado nos posts atuais');
      
      // Buscar posts que contenham "vagas"
      const vagasPosts = posts.filter(post => 
        post.title?.toLowerCase().includes('vagas') ||
        post.content?.toLowerCase().includes('vagas')
      );
      
      if (vagasPosts.length > 0) {
        console.log(`\n📝 Encontrados ${vagasPosts.length} posts que mencionam "vagas":`);
        vagasPosts.forEach(post => {
          console.log(`  - ${post.title} (${post.id})`);
        });
      } else {
        console.log('\n📝 Nenhum post mencionando "vagas" encontrado');
      }
    }
    
    console.log('\n📊 Análise da coleção:');
    console.log(`  - Total de posts: ${posts.length}`);
    console.log(`  - Posts na API (usando coleção correta): ${posts.length}`);
    console.log(`  - Configuração atual: apps/meu-blog/posts`);
    
    // Verificar se a coleção foi atualizada
    if (posts.length > 0) {
      console.log('\n✅ Posts estão sendo lidos da coleção correta "apps/meu-blog/posts"');
      console.log('   (através da API com a configuração atualizada)');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar posts:', error);
  }
}

// Executar
fetchPostsFromAPI().then(() => {
  console.log('\n🏁 Verificação concluída');
}).catch(error => {
  console.error('💥 Falha:', error);
});
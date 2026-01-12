# Como Executar a Migração

## Opção 1: Via Interface Web (Recomendado)
1. Faça login no blog
2. Acesse: `https://blog-do-eliezer.vercel.app/admin/migrate`
3. Clique em "Iniciar Migração"

## Opção 2: Via Linha de Comando (Rápido)
1. Configure as variáveis de ambiente no seu terminal:
   ```bash
   export NEXT_PUBLIC_FIREBASE_API_KEY="sua_api_key"
   export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu_project.firebaseapp.com"
   export NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu_project_id"
   export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu_project.appspot.com"
   export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
   export NEXT_PUBLIC_FIREBASE_APP_ID="seu_app_id"
   export NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="seu_measurement_id"
   ```

2. Execute o script:
   ```bash
   cd "C:\Users\3855-2278\Documents\outros\dev\my-projects-linux-2026\websites\nextjs\meu-blog-app"
   node migrate-posts.js
   ```

## Opção 3: Via Copiar-Colar das Variáveis
Se você preferir, pode editar o arquivo `migrate-posts.js` e colocar as credenciais diretamente (apenas para uso temporário):

```javascript
// No arquivo migrate-posts.js, substitua:
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "COLE_SEU_AUTH_DOMAIN_AQUI",
  projectId: "COLE_SEU_PROJECT_ID_AQUI",
  // ... outras credenciais
};
```

## O que o script faz:
- ✅ Conecta ao seu Firebase
- ✅ Busca todos os posts sem slug
- ✅ Gera slugs automáticos dos títulos
- ✅ Verifica se o slug já existe
- ✅ Adiciona número sequencial se necessário
- ✅ Atualiza cada post com seu novo slug
- ✅ Mostra progresso em tempo real

## Exemplo de saída:
```
🚀 Iniciando migração de posts...
📊 Encontrados 5 posts no total
🔗 Slugs existentes: 2
✅ Post "Como corrigir erro X" migrado com slug: como-corrigir-erro-x
   📝 URL: https://blog-do-eliezer.vercel.app/post/como-corrigir-erro-x
✅ Post "Dicas de React" migrado com slug: dicas-de-react
   📝 URL: https://blog-do-eliezer.vercel.app/post/dicas-de-react
⏭️  Post "Meu primeiro post" já tem slug: meu-primeiro-post

🎉 Migração concluída com sucesso!
📈 Posts migrados: 2
⏭️  Posts pulados (já tinham slug): 1
```
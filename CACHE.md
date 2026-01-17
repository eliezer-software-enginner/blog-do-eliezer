# Cache Management

## APIs Disponíveis

### 1. Limpar Cache Completo
```bash
curl -X POST https://blog-do-eliezer.vercel.app/api/clear-cache \
  -H "Content-Type: application/json" \
  -d '{"all": true}'
```

### 2. Limpar Cache Específico
```bash
# Posts apenas
curl -X POST https://blog-do-eliezer.vercel.app/api/clear-cache \
  -H "Content-Type: application/json" \
  -d '{"tags": ["posts"]}'

# Homepage apenas
curl -X POST https://blog-do-eliezer.vercel.app/api/clear-cache \
  -H "Content-Type: application/json" \
  -d '{"paths": ["/"]}'
```

### 3. Revalidar (método antigo)
```bash
curl -X POST https://seu-site.com/api/revalidate
```

## GitHub Actions

### Auto-limpeza no Push
O workflow `.github/workflows/auto-clear-cache.yml` limpa automaticamente o cache quando há push para main.

**Configurar:**
1. Vá para Settings > Secrets and variables > Actions
2. Adicione `PRODUCTION_SITE_URL` com a URL do seu site

### Execução Manual
Vá para Actions > Auto Clear Cache on Push > "Run workflow"

### Testar API
Vá para Actions > Test Cache API > "Run workflow" para verificar se a API está funcionando

## Script Local
```bash
# Instalar no Windows (Git Bash ou WSL)
chmod +x scripts/clear-cache.sh

# Usar
./scripts/clear-cache.sh all
./scripts/clear-cache.sh posts
./scripts/clear-cache.sh homepage
```

## Quando Limpar Cache

- ✅ Após criar novo post (automático)
- ✅ Após editar post existente
- ✅ Após push no GitHub (automático)
- ✅ Manualmente se necessário
- ✅ Após alterações no layout/template
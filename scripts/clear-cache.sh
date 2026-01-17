#!/bin/bash

# Script para limpar cache do site manualmente
# Uso: ./scripts/clear-cache.sh [all|posts|homepage]

SITE_URL="https://blog-do-eliezer.vercel.app"  # URL do site em produção

case "${1:-all}" in
  "all")
    echo "🔄 Limpando todo o cache..."
    curl -X POST "$SITE_URL/api/clear-cache" \
      -H "Content-Type: application/json" \
      -d '{"all": true}'
    ;;
  "posts")
    echo "🔄 Limpando cache dos posts..."
    curl -X POST "$SITE_URL/api/clear-cache" \
      -H "Content-Type: application/json" \
      -d '{"tags": ["posts"]}'
    ;;
  "homepage")
    echo "🔄 Limpando cache da homepage..."
    curl -X POST "$SITE_URL/api/clear-cache" \
      -H "Content-Type: application/json" \
      -d '{"paths": ["/"]}'
    ;;
  *)
    echo "Uso: $0 [all|posts|homepage]"
    exit 1
    ;;
esac

echo -e "\n✅ Limpeza de cache concluída!"
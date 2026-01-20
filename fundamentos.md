# Fundamentos do Blog - Preview de Links Compartilhados e Arquitetura

## Visão Geral

Este documento explica como foi implementado o sistema de preview para links compartilhados (Open Graph), incluindo posts individuais e a página principal, além das estratégias de cache e a arquitetura com Firebase.

## Preview de Links Compartilhados (Open Graph Protocol)

### Como Funciona

Quando você compartilha um link em redes sociais (WhatsApp, Twitter, Facebook, LinkedIn), o serviço faz uma requisição HTTP para a URL e analisa as meta tags HTML para gerar um preview com:

- **Imagem** (og:image)
- **Título** (og:title) 
- **Descrição** (og:description)
- **URL** (og:url)

### Implementação no Next.js

```typescript
// app/layout.tsx - Meta tags globais
export const metadata: Metadata = {
  title: 'Meu Blog',
  description: 'Blog pessoal sobre tecnologia e desenvolvimento',
  openGraph: {
    title: 'Meu Blog',
    description: 'Blog pessoal sobre tecnologia e desenvolvimento',
    images: ['/og-image.jpg'], // Imagem padrão
    url: 'https://seu-blog.vercel.app',
    type: 'website',
  },
};

// app/posts/[id]/page.tsx - Meta tags dinâmicas para posts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id);
  
  return {
    title: post.title,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      images: [post.imageUrl || '/default-post.jpg'],
      url: `https://seu-blog.vercel.app/posts/${params.id}`,
      type: 'article',
    },
  };
}
```

### Comparação com HTML Puro

#### Abordagem HTML Puro (Tradicional)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Meta tags para Open Graph -->
  <meta property="og:title" content="Título do Post">
  <meta property="og:description" content="Descrição do post...">
  <meta property="og:image" content="https://exemplo.com/imagem.jpg">
  <meta property="og:url" content="https://exemplo.com/post/123">
  <meta property="og:type" content="article">
  
  <!-- Outras meta tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Título do Post">
  <meta name="twitter:description" content="Descrição do post...">
  <meta name="twitter:image" content="https://exemplo.com/imagem.jpg">
  
  <title>Título do Post</title>
</head>
<body>
  <!-- Conteúdo do post -->
</body>
</html>
```

#### Vantagens do Next.js vs HTML Puro

| Característica | HTML Puro | Next.js |
|---|---|---|
| **Renderização** | Estática no servidor | Híbrida (SSR/SSG) |
| **Meta tags dinâmicas** | Requer backend customizado | Nativo via generateMetadata |
| **Performance** | Depende de servidor otimizado | CDN + Cache automático |
| **SEO** | Manual | Automático e otimizado |
| **Manutenibilidade** | Complexa | Simplificada |

## Estratégias de Cache Implementadas

### 1. Cache de Nível de Página (Next.js)

```typescript
// Configuração de cache para posts
export const revalidate = 3600; // Revalida a cada 1 hora

// Cache estático para posts não alterados
export const dynamic = 'force-static';
```

### 2. Cache de Dados (Firebase)

```typescript
// lib/firebase.ts - Configuração de cache
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Habilita cache offline no cliente
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support persistence.');
    }
  });
}
```

### 3. Cache de Imagens

```typescript
// Componente Image otimizado
import Image from 'next/image';

<Image
  src={post.imageUrl}
  alt={post.title}
  width={800}
  height={400}
  priority // Para imagens acima da dobra
  placeholder="blur" // Placeholder enquanto carrega
/>
```

### 4. Cache de API (Server-side)

```typescript
// app/api/posts/route.ts
export const GET = async (request: Request) => {
  const posts = await getPosts(); // Com cache interno
  
  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
```

## Por que Usar Firebase como Camada de API?

### 1. Problemas com Acesso Direto ao Cliente

**Acesso direto (Problemas):**
```typescript
// ❌ Problema: Expor credenciais no cliente
const db = getFirestore();
const posts = await getDocs(collection(db, 'posts'));
// Credenciais visíveis no navegador
```

### 2. Vantagens da Camada de API com Firebase

#### Segurança
```typescript
// ✅ Servidor protege credenciais
// app/api/posts/route.ts
const db = getFirestore(); // Seguro no servidor
const posts = await getDocs(collection(db, 'posts'));
```

#### Validação e Sanitização
```typescript
// app/api/posts/route.ts
export const POST = async (request: Request) => {
  const body = await request.json();
  
  // Validação dos dados
  if (!body.title || body.title.length > 100) {
    return NextResponse.json({ error: 'Título inválido' }, { status: 400 });
  }
  
  // Sanitização
  const sanitizedPost = {
    title: sanitizeHtml(body.title),
    content: sanitizeHtml(body.content),
    createdAt: new Date(),
  };
  
  // Salva no Firebase
  await addDoc(collection(db, 'posts'), sanitizedPost);
  
  return NextResponse.json({ success: true });
};
```

#### Rate Limiting
```typescript
// Middleware de rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições
});
```

### 3. Arquitetura em Camadas

```
Cliente (Browser)
    ↓
Next.js API Routes (Serverless)
    ↓
Firebase Firestore (Database)
    ↓
Firebase Storage (Imagens)
```

### 4. Benefícios da Abordagem

| Benefício | Descrição |
|---|---|
| **Segurança** | Credenciais protegidas no servidor |
| **Performance** | Cache em múltiplos níveis |
| **Escalabilidade** | Serverless escala automaticamente |
| **Manutenibilidade** | Lógica centralizada em APIs |
| **Flexibilidade** | Fácil adicionar validações e regras |

## Implementação Completa do Preview

### 1. Meta Tags Dinâmicas

```typescript
// app/posts/[id]/page.tsx
export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPost(params.id);
  
  if (!post) {
    return {
      title: 'Post não encontrado',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: [
        {
          url: post.coverImage || '/default-og.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      url: `https://seu-blog.vercel.app/posts/${params.id}`,
      type: 'article',
      publishedTime: post.createdAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: [post.coverImage || '/default-og.jpg'],
    },
  };
}
```

### 2. Geração de Imagens OG

```typescript
// app/api/og/route.ts - Geração dinâmica de imagens
import { ImageResponse } from 'next/og';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Meu Blog';
  
  return new ImageResponse(
    (
      <div style={{ fontSize: 60, background: 'white', width: '100%', height: '100%' }}>
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
};
```

## Resumo da Arquitetura

1. **Preview de Links**: Open Graph via meta tags dinâmicas do Next.js
2. **Cache**: Múltiplas camadas (página, dados, imagens, API)
3. **Firebase**: Camada de API segura com validação
4. **Performance**: Otimização com CDN e cache inteligente
5. **SEO**: Meta tags estruturadas para melhor indexação

Esta abordagem garante previews consistentes, performance otimizada e segurança robusta para o blog.
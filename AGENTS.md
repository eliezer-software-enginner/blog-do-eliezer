# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this Next.js blog application repository.

## Project Overview

This is a Next.js 16 blog application using:
- React 19 with TypeScript
- Firebase for authentication and data storage
- Tailwind CSS v4 for styling
- Radix UI components
- App Router architecture

## Development Commands

### Core Commands
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
No test framework is currently configured. When adding tests, use Jest/React Testing Library and update this section.

## Code Style Guidelines

### File Extensions
- Use `.tsx` for React components with TypeScript
- Use `.ts` for utility files and non-React TypeScript
- Use `.jsx` for React components without TypeScript (legacy files)
- Use `.js` for utility files without TypeScript (legacy files)

### Import Organization
```typescript
// 1. React/Next.js imports
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 2. Third-party libraries
import { collection, getDocs } from 'firebase/firestore';
import { cva } from 'class-variance-authority';

// 3. Internal imports (use @/ alias)
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
```

### Component Structure
```typescript
'use client'; // Add for client components

import { useState } from 'react';

export default function ComponentName() {
  const [state, setState] = useState();

  return (
    <div className="container">
      {/* JSX content */}
    </div>
  );
}
```

### TypeScript Patterns
- Use strict TypeScript configuration
- Define interfaces for component props
- Use proper typing for Firebase data
- Leverage `VariantProps` from class-variance-authority

### Styling Conventions
- Use Tailwind CSS classes
- Leverage `cn()` utility from `@/lib/utils` for conditional classes
- Use CSS Modules for component-specific styles (`.module.css`)
- Follow class-variance-authority patterns for component variants

### Firebase Integration
- Import Firebase functions from `@/lib/firebase`
- Use proper error handling with try-catch blocks
- Handle loading states appropriately
- Use `toDate()` for Firestore timestamps

### Naming Conventions
- Components: PascalCase (`PostCard`, `Header`)
- Files: PascalCase for components (`PostCard.tsx`)
- Variables: camelCase (`postsList`, `isLoading`)
- Functions: camelCase with descriptive names (`fetchPosts`, `handleSignIn`)
- Constants: UPPER_SNAKE_CASE for exports (`API_BASE_URL`)

### Error Handling
```typescript
try {
  const result = await someOperation();
  setData(result);
} catch (error) {
  console.error('Error description: ', error);
  // Optionally set error state for UI feedback
} finally {
  setLoading(false);
}
```

### State Management
- Use React hooks for local state
- Use AuthContext for authentication state
- Consider implementing a global state solution for complex applications

### Path Aliases
- Use `@/` prefix for all internal imports
- Configured in `tsconfig.json` with paths: `"@/*": ["./*"]`

### Environment Variables
- Use `.env.local` for development (never commit)
- Use `.env.example` as template for team members
- Client-side variables: prefix with `NEXT_PUBLIC_`
- Server-side only: no prefix (safer)
- Use `serverDb` for server-side operations when possible

### ESLint Configuration
- Uses Next.js ESLint configuration with TypeScript support
- Configured for core web vitals
- Run `npm run lint` before commits

### Component Props
```typescript
interface ComponentProps {
  title: string;
  content?: string; // Optional props
  variant?: 'default' | 'secondary'; // Union types
  children?: React.ReactNode;
}

export function Component({ title, content, variant = 'default', children }: ComponentProps) {
  // Component logic
}
```

### Firebase Data Patterns
```typescript
// Firestore document mapping
const postsList = postSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

// Timestamp handling
const date = post.createdAt?.toDate() 
  ? post.createdAt.toDate() 
  : post.createdAt || new Date();
```

## Architecture Notes

### App Router Structure
- Use `app/` directory for routes
- Layout in `app/layout.tsx`
- Pages as `page.tsx` or `page.jsx`
- Dynamic routes with `[id]` folders

### Component Organization
- UI components in `components/ui/`
- Page-specific components in `app/components/`
- Shared utilities in `lib/`
- Context providers in `app/context/`

### Authentication Flow
- Firebase Auth with Google provider
- AuthContext wraps the application
- Use `useAuth()` hook for authentication state

## Best Practices

1. Always add `'use client';` directive for client components
2. Use proper TypeScript types for all props and state
3. Implement loading states for async operations
4. Handle errors gracefully with user feedback
5. Use semantic HTML elements
6. Optimize images with Next.js Image component
7. Follow accessibility guidelines (ARIA labels, etc.)
8. Keep components small and focused
9. Use proper React key props for lists
10. Implement proper cleanup in useEffect hooks

## Adding New Features

1. Create new components in appropriate directories
2. Follow existing patterns for styling and structure
3. Update TypeScript types as needed
4. Test responsive design with Tailwind breakpoints
5. Consider SEO implications for public pages
6. Update this AGENTS.md file with new patterns or commands
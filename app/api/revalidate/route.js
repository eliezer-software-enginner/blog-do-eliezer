import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST() {
  try {
    // Revalida o cache da API de posts
    revalidateTag('posts');
    
    // Revalida a página inicial
    revalidateTag('/');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache limpo com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao limpar cache' },
      { status: 500 }
    );
  }
}
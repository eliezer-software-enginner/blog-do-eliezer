import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const body = await request.json();
    const { paths = [], tags = [], all = false } = body;

    if (all) {
      // Limpa todo o cache
      revalidatePath('/');
      revalidatePath('/api/posts');
      revalidateTag('posts');
      revalidateTag('homepage');
    } else {
      // Limpa paths específicos
      for (const path of paths) {
        revalidatePath(path);
      }
      
      // Limpa tags específicas
      for (const tag of tags) {
        revalidateTag(tag);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cache limpo com sucesso',
      cleared: { paths, tags, all }
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao limpar cache' },
      { status: 500 }
    );
  }
}
/**
 * Converte texto para um slug amigável para SEO
 * @param text Texto para converter
 * @returns Slug formatado
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove múltiplos hífens
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
}

/**
 * Gera um slug único adicionando um sufixo numérico se necessário
 * @param baseSlug Slug base
 * @param existingSlugs Array de slugs existentes
 * @returns Slug único
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
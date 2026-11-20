import type { ImageMetadata } from 'astro';

/**
 * Alle Fotos aus src/assets/fotos, nach Dateiname ohne Endung.
 * Fehlt ein Foto, liefert getFoto() undefined und die Seite zeigt den Platzhalter.
 */
const files = import.meta.glob<ImageMetadata>('../assets/fotos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', {
  eager: true,
  import: 'default',
});

const byName = new Map<string, ImageMetadata>(
  Object.entries(files).map(([path, img]) => [path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase(), img]),
);

export const getFoto = (name: string): ImageMetadata | undefined => byName.get(name.toLowerCase());

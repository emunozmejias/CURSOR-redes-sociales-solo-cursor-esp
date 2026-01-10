'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocial } from '@/context/SocialContext';

export default function CrearPublicacionPage() {
  const router = useRouter();
  const { currentUser, addPost } = useSocial();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Por favor inicia sesión para crear una publicación.
          </p>
        </div>
      </main>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newUrls: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newUrls.push(url);
        // En una app real, aquí subirías la imagen a un servidor
        // Por ahora, guardamos la URL temporal
        newImages.push(url);
      }
    });

    setImages([...images, ...newImages]);
    setImageUrls([...imageUrls, ...newUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Simular delay de publicación
    await new Promise((resolve) => setTimeout(resolve, 500));

    addPost({
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
    });

    // Limpiar formulario
    setContent('');
    setImages([]);
    setImageUrls([]);
    setIsSubmitting(false);

    // Redirigir al feed
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:px-6 md:pb-6">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Crear nueva publicación
        </h2>

        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black">
          {/* Información del usuario */}
          <div className="mb-4 flex items-center gap-3">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {currentUser.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{currentUser.username}
              </p>
            </div>
          </div>

          {/* Textarea para contenido */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿En qué estás pensando?"
            rows={6}
            className="mb-4 w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
            disabled={isSubmitting}
          />

          {/* Vista previa de imágenes */}
          {imageUrls.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <img
                    src={url}
                    alt={`Vista previa ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                    aria-label="Eliminar imagen"
                  >
                    <span className="text-sm">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Contador de caracteres */}
          <div className="mb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <span className="text-xl">📷</span>
              <span>Agregar imágenes ({images.length})</span>
            </label>
            <span>{content.length} caracteres</span>
          </div>

          {/* Botón de publicar */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={(!content.trim() && images.length === 0) || isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

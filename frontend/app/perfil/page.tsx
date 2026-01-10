'use client';

import { useState } from 'react';
import { useSocial } from '@/context/SocialContext';
import PostCard from '@/components/PostCard';

export default function PerfilPage() {
  const { currentUser, posts, updateUserProfile } = useSocial();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
    email: currentUser?.email || '',
  });

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Por favor inicia sesión para ver tu perfil.
          </p>
        </div>
      </main>
    );
  }

  const userPosts = posts.filter((post) => post.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUserProfile(currentUser.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      username: currentUser.username,
      bio: currentUser.bio,
      email: currentUser.email,
    });
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:px-6 md:pb-6">
        {/* Header del perfil */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-black">
          {/* Imagen de portada */}
          <div className="h-32 w-full rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600" />
          
          {/* Información del perfil */}
          <div className="relative px-6 pb-6">
            <div className="-mt-12 mb-4">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-24 w-24 rounded-full border-4 border-white dark:border-black"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-500 text-3xl font-bold text-white dark:border-black">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Biografía
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentUser.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    @{currentUser.username}
                  </p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {currentUser.bio || 'No hay biografía todavía.'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Editar perfil
                </button>
              </>
            )}
          </div>
        </div>

        {/* Publicaciones del usuario */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Mis publicaciones ({userPosts.length})
          </h2>
          {userPosts.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-black">
              <p className="text-gray-600 dark:text-gray-400">
                Aún no has publicado nada. ¡Crea tu primera publicación!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

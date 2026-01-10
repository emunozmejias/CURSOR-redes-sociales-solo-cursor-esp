'use client';

import { useSocial } from '@/context/SocialContext';
import PostCard from '@/components/PostCard';

export default function Home() {
  const { posts } = useSocial();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:px-6 md:pb-6">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Feed de Inicio
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-black">
            <p className="text-gray-600 dark:text-gray-400">
              No hay publicaciones todavía. ¡Sé el primero en publicar!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

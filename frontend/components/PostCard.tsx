'use client';

import { useState } from 'react';
import { useSocial } from '@/context/SocialContext';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { currentUser, toggleLike, addComment } = useSocial();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiked = post.likes.some((like) => like.userId === currentUser?.id);
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      await toggleLike(post.id);
    } catch (error: any) {
      alert(error.message || 'Error al dar like');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(post.id, {
        postId: post.id,
        userId: currentUser.id,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (error: any) {
      alert(error.message || 'Error al agregar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black">
      {/* Header del post */}
      <div className="mb-3 flex items-center gap-3">
        {post.user?.avatar ? (
          <img
            src={post.user.avatar}
            alt={post.user?.name || 'Usuario'}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
            {(post.user?.name && post.user.name.length > 0)
              ? post.user.name.charAt(0).toUpperCase()
              : post.user?.username && post.user.username.length > 0
              ? post.user.username.charAt(0).toUpperCase()
              : 'U'}
          </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">
            {post.user?.name || 'Usuario'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{post.user?.username || 'usuario'} · {formatDate(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Contenido del post */}
      <div className="mb-3">
        <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
          {post.content}
        </p>
      </div>

      {/* Imágenes */}
      {post.images && post.images.length > 0 && (
        <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(post.images.length, 3)}, 1fr)` }}>
          {post.images.map((image, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={image}
                alt={`Imagen ${index + 1} del post`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-6 border-t border-gray-200 pt-3 dark:border-gray-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
          }`}
        >
          <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <span className="text-xl">💬</span>
          <span className="text-sm font-medium">{commentsCount}</span>
        </button>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-800">
          {/* Lista de comentarios */}
          <div className="mb-3 max-h-64 space-y-3 overflow-y-auto">
            {post.comments.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay comentarios todavía. Sé el primero en comentar.
              </p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  {comment.user?.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user?.name || 'Usuario'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold">
                      {(comment.user?.name && comment.user.name.length > 0)
                        ? comment.user.name.charAt(0).toUpperCase()
                        : comment.user?.username && comment.user.username.length > 0
                        ? comment.user.username.charAt(0).toUpperCase()
                        : 'U'}
                    </div>
                  )}
                  <div className="flex-1 rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {comment.user?.name || 'Usuario'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Formulario de comentario */}
          {currentUser && (
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '...' : 'Enviar'}
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}

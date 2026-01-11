'use client';

import { useState } from 'react';
import { useSocial } from '@/context/SocialContext';
import type { Post } from '@/types';
import PostCard from './PostCard';

interface PostCardEditableProps {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PostCardEditable({ post, onEdit, onDelete }: PostCardEditableProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser, deletePost } = useSocial();

  const isOwner = currentUser?.id === post.userId;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(post.id);
      if (onDelete) onDelete();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar la publicación');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) onEdit();
  };

  if (!isOwner) {
    return <PostCard post={post} />;
  }

  return (
    <div className="relative">
      {/* Botón de menú */}
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          aria-label="Opciones"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {/* Menú desplegable */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                disabled={isDeleting}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                disabled={isDeleting}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </>
        )}
      </div>

      <PostCard post={post} />
    </div>
  );
}

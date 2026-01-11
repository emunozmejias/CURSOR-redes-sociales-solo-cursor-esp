'use client';

import Link from 'next/link';
import { useSocial } from '@/context/SocialContext';

export default function Header() {
  const { currentUser } = useSocial();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            SocialApp
          </h1>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Inicio
          </Link>
          <Link
            href="/perfil"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Perfil
          </Link>
          <Link
            href="/crear-publicacion"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Crear publicación
          </Link>
        </nav>

        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{currentUser.username || 'usuario'}
              </p>
            </div>
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || 'Usuario'}
                className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                {(currentUser.name && currentUser.name.length > 0)
                  ? currentUser.name.charAt(0).toUpperCase()
                  : currentUser.username && currentUser.username.length > 0
                  ? currentUser.username.charAt(0).toUpperCase()
                  : 'U'}
              </div>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
              }}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Salir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

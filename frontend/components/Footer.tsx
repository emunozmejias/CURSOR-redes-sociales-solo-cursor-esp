export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} SocialApp. Todos los derechos reservados.
          </p>
          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              Privacidad
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              Ayuda
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

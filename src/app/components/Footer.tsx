export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-center gap-8">
          <a
            href="mailto:phaedrus.raznikov@pm.me"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            email
          </a>
          <a
            href="https://github.com/phrazzld"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            github
          </a>
        </div>
      </div>
    </footer>
  );
}

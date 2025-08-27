export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center gap-8">
          <a
            href="mailto:phaedrus.raznikov@pm.me"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            Email
          </a>
          <a
            href="https://github.com/phrazzld"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container-content py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a
              href="mailto:phaedrus.raznikov@pm.me"
              className="relative text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-gray-600 dark:after:bg-gray-400 after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              email
            </a>
            <a
              href="https://github.com/phrazzld"
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-gray-600 dark:after:bg-gray-400 after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              github
            </a>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500">© {currentYear}</div>
        </div>
      </div>
    </footer>
  );
}

export default function CreativeBooksFooter() {
  return (
    <footer className="border-t border-gray-200 mt-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Creative Books SA &mdash; info@creativebooks.co.za &middot; 010 500 3331
        </p>
        <p className="text-xs text-gray-400">Based in South Africa &mdash; serving authors worldwide</p>
      </div>
    </footer>
  );
}
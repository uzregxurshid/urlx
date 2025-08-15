export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between text-sm text-gray-600">
        <p>© {new Date().getFullYear()} urlx</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}

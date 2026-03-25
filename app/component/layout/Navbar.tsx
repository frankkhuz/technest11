export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white">
      <h1 className="text-xl font-bold">Tech Nest</h1>

      <button className="bg-black text-white px-4 py-2 rounded-lg">
        Login
      </button>
    </nav>
  );
}

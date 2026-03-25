import Searchbar from "../component/features/Searchbar";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Find the Best Gadget at the Right Price
      </h1>

      <p className="text-gray-500 mb-6 max-w-md">
        Smart recommendations. Real prices. Trusted sellers.
      </p>

      <Searchbar />
    </main>
  );
}

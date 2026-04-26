interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {

  async function handleSubmit(formData: FormData) {
    const query = formData.get("query") as string;
    onSearch(query);
  }

  return (
    <form action={handleSubmit} className="flex justify-center gap-2">
      <input
        type="text"
        name="query"
        placeholder="Enter book title or author..."
        className="px-3 py-2 border border-gray-300 rounded"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
      >
        Search
      </button>
    </form>
  );
}

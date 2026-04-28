import { useState } from "react";
import { Spinner } from "./ui/spinner";

interface SearchBarProps {
  onQueryChange: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onQueryChange, isLoading = false }: SearchBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [value, setValue] = useState("");

  const hasContent = value.length > 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onQueryChange(e.target.value);
  }

  return (
    <div
      className="relative block mx-auto w-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        className="w-full border-b bg-transparent py-1 pr-8 text-black placeholder-gray-300 focus:outline-none"
        style={{
          borderColor: hasContent ? 'black' : 'rgb(229 231 235)',
        }}
      />
      <Spinner
        className={`pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-black transition-opacity duration-200 ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-px bg-black"
        style={{
          width: isHovered || hasContent ? "100%" : "0%",
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

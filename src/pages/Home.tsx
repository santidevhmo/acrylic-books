import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BookResult } from "../api/searchBooks";
import { searchBooks } from "../api/searchBooks";
import Bookshelf from "../components/Bookshelf";
import SearchBar from "../components/SearchBar";
import { getCurrentUser, logout } from "../lib/authClient";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [books, setBooks] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(query: string) {
    setIsLoading(true);
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await getCurrentUser();
        if (isMounted) {
          setIsLoggedIn(Boolean(response.user));
        }
      } catch {
        if (isMounted) {
          setIsLoggedIn(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setIsLoggedIn(false);
    }
  }

  return (
    <div className="py-8">
      <nav className="flex justify-center items-center py-2 mb-8">
        {isLoggedIn ? (
          <>
            <div className="flex gap-4 mr-4">
              <button className="hover:underline">Read</button>
              <button className="hover:underline">To-Read</button>
            </div>
            <button className="hover:underline" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4 hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </nav>

      <div className="mb-12">
        <h4 className="text-sm uppercase tracking-wide text-gray-600">
          Search for
        </h4>
        <h1 className="text-5xl font-bold">BOOKS</h1>
      </div>

      <div className="mb-12">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="flex items-center justify-center">
        <Bookshelf books={books} isLoading={isLoading} />
      </div>
    </div>
  );
}

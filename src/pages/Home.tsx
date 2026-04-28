import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { BookResult } from "../api/searchBooks";
import { searchBooks } from "../api/searchBooks";
import Bookshelf from "../components/Bookshelf";
import SearchBar from "../components/SearchBar";
import { getCurrentUser, logout } from "../lib/authClient";

type Phase = 'idle' | 'loading' | 'done';

function preloadImages(results: BookResult[]): Promise<void[]> {
  return Promise.allSettled(
    results
      .filter(b => b.coverUrl)
      .map(
        b =>
          new Promise<void>(resolve => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = b.coverUrl!;
          })
      )
  ).then(() => []);
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [books, setBooks] = useState<BookResult[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const requestSequence = useRef(0);

  function handleQueryChange(query: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    abortController.current?.abort();

    if (!query.trim()) {
      requestSequence.current += 1;
      setBooks([]);
      setPhase('idle');
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      const requestId = requestSequence.current + 1;
      requestSequence.current = requestId;
      abortController.current = controller;
      setPhase('loading');
      try {
        const results = await searchBooks(query, controller.signal);
        await preloadImages(results);
        if (requestId !== requestSequence.current || controller.signal.aborted) return;
        setBooks(results);
        setPhase('done');
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (requestId !== requestSequence.current) return;
        setPhase('idle');
      }
    }, 500);
  }

  useEffect(() => {
    document.body.style.overflow = phase !== 'done' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await getCurrentUser();
        if (isMounted) setIsLoggedIn(Boolean(response.user));
      } catch {
        if (isMounted) setIsLoggedIn(false);
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      abortController.current?.abort();
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
    <div className="w-full py-8">
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

      <div className="mb-30 flex flex-col gap-5">
        <h4 className="text-sm text-black m-0">Search for</h4>
        <h1 className="text-[100px] font-semibold m-0">BOOKS</h1>
      </div>

      <div className="mb-12">
        <SearchBar onQueryChange={handleQueryChange} isLoading={phase === 'loading'} />
      </div>

      <Bookshelf books={books} shelfIndex={0} phase={phase} />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import Bookshelf from "../components/Bookshelf";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="py-8">
      {/* Nav */}
      <nav className="flex justify-center items-center py-2 mb-8">
        {isLoggedIn ? (
          <>
            <div className="flex gap-4 mr-4">
              <button className="hover:underline">Read</button>
              <button className="hover:underline">To-Read</button>
            </div>
            <button
              className="hover:underline"
              onClick={() => setIsLoggedIn(false)}
            >
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

      {/* Header */}
      <div className="mb-12">
        <h4 className="text-sm uppercase tracking-wide text-gray-600">
          Search for
        </h4>
        <h1 className="text-5xl font-bold">BOOKS</h1>
      </div>

      <div className="mb-12">
        <SearchBar onSearch={(q) => console.log(q)} />
      </div>

      {/* Bookshelf */}
      <div className="flex items-center justify-center">
        <Bookshelf />
      </div>
    </div>
  );
}

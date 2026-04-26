import type { BookResult } from '../api/searchBooks';
import BookItem from './BookItem';

interface BookshelfProps {
  books: BookResult[];
  isLoading: boolean;
}

export default function Bookshelf({ books, isLoading }: BookshelfProps) {
  return (
    <div
      className="grid gap-3 w-full max-w-2xl"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      }}
    >
      {isLoading
        ? Array.from({ length: 10 }).map((_, i) => <BookItem key={i} />)
        : books.length === 0
          ? null
          : books.map((book) => (
              <BookItem key={book.id} title={book.title} coverUrl={book.coverUrl} />
            ))}
    </div>
  );
}

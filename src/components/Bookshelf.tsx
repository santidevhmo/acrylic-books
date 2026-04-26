import boltImg from '../assets/bolt.png';
import type { BookResult } from '../api/searchBooks';
import BookItem from './BookItem';

const SHELF_COLORS = [
  'rgba(249, 115, 22, 0.72)',
  'rgba(59, 130, 246, 0.72)',
  'rgba(239, 68, 68, 0.72)',
  'rgba(34, 197, 94, 0.72)',
];

const PANEL_HEIGHT = 90;
const PANEL_OFFSET = -25; // px below the row bottom edge
const BOLT_SIZE = 16;
const BOLT_INSET = 18; // px from left/right edge of panel
const COLS_PER_ROW = 5;
const boltBottom = PANEL_OFFSET + PANEL_HEIGHT / 2 - BOLT_SIZE / 2;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

interface BookshelfProps {
  books: BookResult[];
  isLoading: boolean;
  shelfIndex?: number;
}

export default function Bookshelf({ books, isLoading, shelfIndex = 0 }: BookshelfProps) {
  if (!isLoading && books.length === 0) return null;

  const placeholders = Array.from({ length: 10 }, (_, i) => ({ id: `_${i}`, title: '', coverUrl: null }));
  const rows = chunk(isLoading ? placeholders : books, COLS_PER_ROW);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-20">
      {rows.map((rowBooks, rowIndex) => {
        const color = SHELF_COLORS[(shelfIndex + rowIndex) % 4];
        return (
          <div key={rowIndex} className="relative">
            {/* Books — narrower than acrylic via mx-8 */}
            <div
              className="grid gap-3 mx-8"
              style={{ gridTemplateColumns: `repeat(${COLS_PER_ROW}, 1fr)` }}
            >
              {rowBooks.map((book) => (
                <BookItem key={book.id} title={book.title} coverUrl={book.coverUrl} />
              ))}
            </div>

            {/* Acrylic panel — full row width, in front of books */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: PANEL_OFFSET,
                height: PANEL_HEIGHT,
                zIndex: 10,
                borderRadius: 10,
                background: color,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: [
                  'inset 0 1px 0 rgba(255,255,255,0.20)',
                  'inset 0 -1px 0 rgba(0,0,0,0.08)',
                ].join(', '),
              }}
            />

            {/* Left bolt */}
            <img
              src={boltImg}
              alt=""
              style={{
                position: 'absolute',
                left: BOLT_INSET,
                bottom: boltBottom,
                width: BOLT_SIZE,
                height: BOLT_SIZE,
                zIndex: 11,
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.40))',
              }}
            />

            {/* Right bolt */}
            <img
              src={boltImg}
              alt=""
              style={{
                position: 'absolute',
                right: BOLT_INSET,
                bottom: boltBottom,
                width: BOLT_SIZE,
                height: BOLT_SIZE,
                zIndex: 11,
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.40))',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

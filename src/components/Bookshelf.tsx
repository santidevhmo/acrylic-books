import boltImg from '../assets/bolt.png';
import type { BookResult } from '../api/searchBooks';
import BookItem from './BookItem';

const SHELF_COLORS = [
  'rgba(252, 137, 54, 0.68)',
  'rgba(43, 123, 253, 0.5)',
  'rgba(232, 220, 3, 0.5)',
  'rgba(220, 0, 117, 0.5)',
];

const PANEL_HEIGHT = 85;
const PANEL_OFFSET = -15;
const BOLT_SIZE = 16;
const BOLT_INSET = 18;
const COLS_PER_ROW = 5;
const BASE_ROWS = 3;
const boltBottom = PANEL_OFFSET + PANEL_HEIGHT / 2 - BOLT_SIZE / 2;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

interface BookshelfProps {
  books: BookResult[];
  shelfIndex?: number;
  phase: 'idle' | 'loading' | 'done';
}

export default function Bookshelf({ books, shelfIndex = 0, phase }: BookshelfProps) {
  const bookRows = chunk(books, COLS_PER_ROW);
  const rowCount = Math.max(BASE_ROWS, bookRows.length);

  const panelStyle = (color: string) => ({
    position: 'absolute' as const,
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
  });

  const boltStyle = (side: 'left' | 'right') => ({
    position: 'absolute' as const,
    [side]: BOLT_INSET,
    bottom: boltBottom,
    width: BOLT_SIZE,
    height: BOLT_SIZE,
    zIndex: 11,
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.40))',
  });

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-20">
      {Array.from({ length: rowCount }).map((_, rowIndex) => {
        const color = SHELF_COLORS[(shelfIndex + rowIndex) % 4];

        return (
          <div key={rowIndex} className="relative">
            <div
              className="grid gap-1 mx-8"
              style={{ gridTemplateColumns: `repeat(${COLS_PER_ROW}, 1fr)` }}
            >
              {Array.from({ length: COLS_PER_ROW }).map((_, colIndex) => {
                const bookIndex = rowIndex * COLS_PER_ROW + colIndex;
                const book = bookRows[rowIndex]?.[colIndex] ?? null;
                return (
                  <BookItem
                    key={bookIndex}
                    title={book?.title ?? ""}
                    coverUrl={book?.coverUrl ?? null}
                    phase={phase}
                    animationDelay={bookIndex * 0.08}
                  />
                );
              })}
            </div>

            <div style={panelStyle(color)} />
            <img src={boltImg} alt="" style={boltStyle('left')} />
            <img src={boltImg} alt="" style={boltStyle('right')} />
          </div>
        );
      })}
    </div>
  );
}

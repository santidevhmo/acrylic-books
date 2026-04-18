import BookItem from './BookItem';

export default function Bookshelf() {
  return (
    <div
      className="grid gap-3 w-full max-w-2xl"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <BookItem key={i} />
      ))}
    </div>
  );
}

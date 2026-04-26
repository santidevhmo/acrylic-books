interface BookItemProps {
  title?: string;
  coverUrl?: string | null;
}

export default function BookItem({ title = "", coverUrl = null }: BookItemProps) {
  return (
    <div
      className="bg-gray-300 w-full overflow-hidden"
      style={{
        aspectRatio: '2/3',
        boxShadow: '0 6px 16px rgba(0,0,0,0.28), 0 2px 4px rgba(0,0,0,0.16)',
      }}
    >
      {coverUrl && (
        <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
      )}
    </div>
  );
}

interface BookItemProps {
  title?: string;
  coverUrl?: string | null;
}

export default function BookItem({ title = "", coverUrl = null }: BookItemProps) {
  return (
    <div className="bg-gray-300 w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
      {coverUrl && (
        <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
      )}
    </div>
  );
}

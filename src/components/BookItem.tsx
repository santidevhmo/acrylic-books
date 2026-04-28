import { Book } from "./ui/book";

interface BookItemProps {
  title?: string;
  coverUrl?: string | null;
  phase: 'idle' | 'loading' | 'done';
  animationDelay?: number;
}

export default function BookItem({ title = "", coverUrl = null, phase, animationDelay = 0 }: BookItemProps) {
  const wrapperStyle = {
    opacity: phase === 'loading' || !coverUrl ? 0 : 1,
  };

  return (
    <div className="flex justify-center transition-opacity duration-300 ease-out" style={wrapperStyle}>
      <Book
        title={title}
        variant="simple"
        color="white"
        illustration={<></>}
        width={136}
        textured
        coverUrl={coverUrl ?? undefined}
        animationDelay={animationDelay}
      />
    </div>
  );
}

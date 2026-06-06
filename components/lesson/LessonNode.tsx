type Props = {
  title: string;

  unlocked: boolean;

  completed?: boolean;
};

export default function LessonNode({
  title,
  unlocked,
  completed,
}: Props) {
  return (
    <div className="flex flex-col items-center">
      <button
        className={`w-24 h-24 rounded-full text-white font-bold shadow-lg transition-all

        ${
          completed
            ? "bg-green-500"
            : unlocked
            ? "bg-yellow-400"
            : "bg-gray-300"
        }
        `}
      >
        {completed
          ? "✓"
          : unlocked
          ? "▶"
          : "🔒"}
      </button>

      <p className="mt-3 text-sm text-center max-w-25">
        {title}
      </p>
    </div>
  );
}
type Props = {
  title: string;

  description: string;

  unlocked: boolean;
};

export default function AchievementCard({
  title,
  description,
  unlocked,
}: Props) {
  return (
    <div
      className={`rounded-3xl p-5 border

      ${
        unlocked
          ? "bg-purple-50 border-purple-200"
          : "bg-gray-100"
      }
      `}
    >
      <h2 className="font-bold">
        {title}
      </h2>

      <p className="text-sm text-gray-600 mt-1">
        {description}
      </p>

      <p className="mt-3 font-medium">
        {unlocked
          ? "Unlocked 🎉"
          : "Locked 🔒"}
      </p>
    </div>
  );
}
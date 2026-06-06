type Props = {
  value: number;
};

export default function ProgressBar({
  value,
}: Props) {
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-orange-400 rounded-full transition-all"
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}
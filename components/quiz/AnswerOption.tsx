type Props = {
  text: string;

  selected: boolean;

  onClick: () => void;
};

export default function AnswerOption({
  text,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`border rounded-2xl py-4 font-medium transition-all

      ${
        selected
          ? "border-purple-600 bg-purple-50"
          : "border-gray-200"
      }
      `}
    >
      {text}
    </button>
  );
}
import ProgressBar from "../ui/ProgressBar";
import Button from "../ui/Button";

type Props = {
  title: string;
  level: number;
  progress: number;
};

export default function LessonCard({
  title,
  level,
  progress,
}: Props) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <p className="text-sm text-gray-400">
        Continue Learning
      </p>

      <h2 className="font-bold mt-2">
        {title}
      </h2>

      <p className="text-sm mt-1">
        Level {level}
      </p>

      <div className="mt-4">
        <ProgressBar value={progress} />
      </div>

      <Button className="mt-4">
        Start Lesson
      </Button>
    </div>
  );
}
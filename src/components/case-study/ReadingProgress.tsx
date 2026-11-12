import { useReadingProgress } from "../../hooks/useReadingProgress";

export default function ReadingProgress() {
  const progress = useReadingProgress();

  return <div className="reading-progress" style={{ width: `${progress}%` }}></div>;
}

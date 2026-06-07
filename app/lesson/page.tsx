import { Suspense } from "react";
import LessonPageClient from "./LessonPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading lesson...</div>}>
      <LessonPageClient />
    </Suspense>
  );
}


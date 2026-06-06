"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Confetti from "react-confetti";

import AppShell from "@/components/layout/AppShell";

import Button from "@/components/ui/Button";

import AnswerOption from "@/components/quiz/AnswerOption";

import { quizzes } from "@/data/quizzes";

import { useQuizStore } from "@/store/quizStore";

function MascotBubble({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl bg-purple-50 p-4 shadow-sm">
      <p className="text-gray-800 font-medium">
        {message}
      </p>
    </div>
  );
}

export default function QuizPage() {
  const router = useRouter();

  const [selected, setSelected] =
    useState("");

  const [showResult, setShowResult] =
    useState(false);

  const [windowSize, setWindowSize] =
    useState({
      width: 0,
      height: 0,
    });

  // useQuizStore may expose differently named properties depending on implementation.
  // Grab the store object, then pull known functions and try common names for current question.
  const quizStore = useQuizStore();

  const {
    addXP,
    nextQuestion,
    increaseStreak,
    resetQuiz,
    updateLessonProgress,
  } = quizStore as any;

  // Support multiple possible property names for current question index
  const currentQuestion =
    (quizStore as any).currentQuestion ??
    (quizStore as any).current ??
    (quizStore as any).currentIndex ??
    (quizStore as any).currentQuestionIndex ??
    0;

  const quiz = quizzes[currentQuestion];

  const correct =
    selected === quiz.answer;

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  function handleCheck() {
    if (!selected) return;

    setShowResult(true);

    increaseStreak();

    if (correct) {
      addXP(10);

      // Progress increases
      updateLessonProgress(20);
    }
  }

  function handleContinue() {
    if (
      currentQuestion <
      quizzes.length - 1
    ) {
      nextQuestion();

      setSelected("");

      setShowResult(false);
    } else {
      resetQuiz();

      router.push("/dashboard");
    }
  }

  const showConfetti =
    showResult && correct;

  return (
    <AppShell>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={250}
        />
      )}

      <div className="p-4">
        {/* Progress */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 transition-all duration-500"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  quizzes.length) *
                100
              }%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="mt-6">
          <MascotBubble
            message={quiz.question}
          />
        </div>

        {/* Answers */}
        <div className="mt-8 flex flex-col gap-4">
          {quiz.options.map((option) => (
            <AnswerOption
              key={option}
              text={option}
              selected={
                selected === option
              }
              onClick={() =>
                setSelected(option)
              }
            />
          ))}
        </div>

        {/* Check */}
        {!showResult ? (
          <div className="mt-8">
            <Button onClick={handleCheck}>
              Check
            </Button>
          </div>
        ) : (
          <div
            className={`mt-8 rounded-3xl p-5 text-center shadow-sm

            ${
              correct
                ? "bg-purple-50"
                : "bg-red-50"
            }
            `}
          >
            <h2 className="text-2xl font-bold">
              {correct
                ? "Nice Work!"
                : "Almost There"}
            </h2>

            <p className="mt-2 text-gray-600">
              {quiz.explanation}
            </p>

            <p className="mt-4 font-semibold">
              Correct Answer: {quiz.answer}
            </p>

            {correct && (
              <div className="mt-3 text-sm font-medium text-purple-700">
                +10 XP Earned
              </div>
            )}

            <Button
              variant={
                correct
                  ? "primary"
                  : "danger"
              }
              className="mt-6"
              onClick={handleContinue}
            >
              {currentQuestion ===
              quizzes.length - 1
                ? "Finish"
                : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
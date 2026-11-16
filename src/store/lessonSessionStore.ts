import { create } from 'zustand';

import type { Exercise } from '@/types';
import {
  matchAcceptedAnswer,
  toAcceptedAnswers,
  type AnswerValidationOptions,
} from '@/utils/answerValidation';

/** One recorded attempt on an exercise. */
export interface ExerciseAttempt {
  exerciseId: string;
  /** Raw learner input of the latest attempt. */
  input: string;
  /** True once any attempt was answered correctly (stays true on retries). */
  correct: boolean;
  /** Accepted variant matched by the successful attempt, if any. */
  matchedAnswer?: string;
  /** Total attempts made on this exercise. */
  attempts: number;
}

/** Feedback for a single submitted answer (issue #76). */
export interface AttemptFeedback {
  exerciseId: string;
  correct: boolean;
  /** First accepted answer, shown to the learner after a mistake. */
  correctAnswer?: string;
  /** The accepted variant the learner matched, when correct. */
  matchedAnswer?: string;
}

interface LessonSessionState {
  lessonId: string | null;
  /** The lesson's exercises, in order. */
  exercises: Exercise[];
  currentIndex: number;
  attempts: Record<string, ExerciseAttempt>;

  startLesson: (lessonId: string, exercises: Exercise[]) => void;
  /** Validates the current exercise; records the attempt and returns feedback. */
  submitAnswer: (
    input: string,
    options?: AnswerValidationOptions,
  ) => AttemptFeedback | null;
  /** Advances to the next exercise (no-op on the last one). */
  nextExercise: () => void;
  reset: () => void;
}

/** Lesson score: solved exercises over total exercises (issue #76). */
export function computeLessonScore(
  attempts: Record<string, ExerciseAttempt>,
  totalExercises: number,
): { score: number; maxScore: number } {
  const score = Object.values(attempts).filter(
    attempt => attempt.correct,
  ).length;
  return { score, maxScore: totalExercises };
}

export const useLessonSessionStore = create<LessonSessionState>()(set => ({
  lessonId: null,
  exercises: [],
  currentIndex: 0,
  attempts: {},

  startLesson: (lessonId, exercises) =>
    set({ lessonId, exercises, currentIndex: 0, attempts: {} }),

  submitAnswer: (input, options) => {
    let feedback: AttemptFeedback | null = null;
    set(state => {
      const exercise = state.exercises[state.currentIndex];
      if (!exercise) {
        return state;
      }
      const accepted = toAcceptedAnswers(exercise.answer);
      const matched = matchAcceptedAnswer(input, accepted, options);
      const correct = matched !== null;
      const previous = state.attempts[exercise.id];
      const attempt: ExerciseAttempt = {
        exerciseId: exercise.id,
        input,
        correct: correct || (previous?.correct ?? false),
        matchedAnswer: matched ?? previous?.matchedAnswer,
        attempts: (previous?.attempts ?? 0) + 1,
      };
      feedback = {
        exerciseId: exercise.id,
        correct,
        correctAnswer: accepted[0],
        matchedAnswer: matched ?? undefined,
      };
      return {
        attempts: { ...state.attempts, [exercise.id]: attempt },
      };
    });
    return feedback;
  },

  nextExercise: () =>
    set(state => ({
      currentIndex: Math.min(state.currentIndex + 1, state.exercises.length),
    })),

  reset: () =>
    set({ lessonId: null, exercises: [], currentIndex: 0, attempts: {} }),
}));
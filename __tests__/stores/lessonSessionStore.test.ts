import type { Exercise } from '@/types';
import { toAcceptedAnswers } from '@/utils/answerValidation';
import {
  computeLessonScore,
  useLessonSessionStore,
} from '@/store/lessonSessionStore';

function exercise(id: string, answer: unknown): Exercise {
  return {
    id,
    type: 'translation',
    prompt: { en: `Translate: ${id}` },
    answer,
    dialect: 'tachelhit',
  };
}

const greeting = exercise('ex-1', ['azul', 'ⴰⵣⵓⵍ']);
const intro = exercise('ex-2', 'isem');

beforeEach(() => {
  useLessonSessionStore.getState().reset();
});

describe('toAcceptedAnswers', () => {
  it('wraps a single string and filters arrays', () => {
    expect(toAcceptedAnswers('azul')).toEqual(['azul']);
    expect(toAcceptedAnswers(['azul', 'ⴰⵣⵓⵍ', '', 42])).toEqual([
      'azul',
      'ⴰⵣⵓⵍ',
    ]);
    expect(toAcceptedAnswers(null)).toEqual([]);
    expect(toAcceptedAnswers('')).toEqual([]);
  });
});

describe('lessonSessionStore', () => {
  it('starts empty and ignores answers outside a lesson', () => {
    expect(useLessonSessionStore.getState().submitAnswer('azul')).toBeNull();
  });

  it('accepts Tifinagh and Latin variants of the same answer', () => {
    useLessonSessionStore.getState().startLesson('lesson-1', [greeting]);
    const store = useLessonSessionStore.getState();

    const tifinagh = store.submitAnswer(' ⴰⵣⵓⵍ ');
    expect(tifinagh).toMatchObject({ correct: true, matchedAnswer: 'ⴰⵣⵓⵍ' });

    store.nextExercise();
    store.startLesson('lesson-1', [greeting]);
    const latin = useLessonSessionStore.getState().submitAnswer('AZUL!');
    expect(latin).toMatchObject({ correct: true, matchedAnswer: 'azul' });
  });

  it('returns the correct answer after a mistake and keeps it on retry', () => {
    useLessonSessionStore.getState().startLesson('lesson-1', [intro]);
    const store = useLessonSessionStore.getState();

    const wrong = store.submitAnswer('idurar');
    expect(wrong).toMatchObject({ correct: false, correctAnswer: 'isem' });
    expect(useLessonSessionStore.getState().attempts['ex-2']).toMatchObject({
      attempts: 1,
      correct: false,
    });

    const right = store.submitAnswer('isem');
    expect(right).toMatchObject({ correct: true, matchedAnswer: 'isem' });
    expect(useLessonSessionStore.getState().attempts['ex-2']).toMatchObject({
      attempts: 2,
      correct: true,
    });
  });

  it('advances through exercises and computes the lesson score', () => {
    useLessonSessionStore.getState().startLesson('lesson-1', [greeting, intro]);
    const store = useLessonSessionStore.getState();

    store.submitAnswer('azul');
    store.nextExercise();
    expect(useLessonSessionStore.getState().currentIndex).toBe(1);

    // Wrong answer on the last exercise still counts as attempted.
    store.submitAnswer('wrong');
    store.nextExercise();

    const state = useLessonSessionStore.getState();
    expect(state.currentIndex).toBe(2); // clamped: no exercise at index 2
    expect(computeLessonScore(state.attempts, state.exercises.length)).toEqual({
      score: 1,
      maxScore: 2,
    });
  });

  it('reset clears the session', () => {
    useLessonSessionStore.getState().startLesson('lesson-1', [greeting]);
    useLessonSessionStore.getState().submitAnswer('azul');
    useLessonSessionStore.getState().reset();

    const state = useLessonSessionStore.getState();
    expect(state.lessonId).toBeNull();
    expect(state.exercises).toEqual([]);
    expect(state.attempts).toEqual({});
  });
});
import React from 'react';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export function DashboardScreen() {
  return (
    <PlaceholderScreen title="Dashboard" subtitle="Your learning journey" />
  );
}

export function CourseDetailsScreen() {
  return <PlaceholderScreen title="Course details" />;
}

export function ModuleScreen() {
  return <PlaceholderScreen title="Module" />;
}

export function LessonScreen() {
  return <PlaceholderScreen title="Lesson" />;
}

export function ExerciseScreen() {
  return <PlaceholderScreen title="Exercise" />;
}

export function LessonCompleteScreen() {
  return <PlaceholderScreen title="Lesson complete" />;
}

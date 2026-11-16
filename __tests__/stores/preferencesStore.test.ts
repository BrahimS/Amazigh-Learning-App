import { usePreferencesStore } from '@/store/preferencesStore';

beforeEach(() => {
  usePreferencesStore.setState({
    dialect: 'tachelhit',
    uiLanguage: 'fr',
    learningGoal: null,
    dailyGoalMinutes: 10,
    hasCompletedOnboarding: false,
  });
});

describe('preferencesStore', () => {
  it('has sensible defaults', () => {
    const state = usePreferencesStore.getState();
    expect(state.dialect).toBe('tachelhit');
    expect(state.uiLanguage).toBe('fr');
    expect(state.dailyGoalMinutes).toBe(10);
    expect(state.hasCompletedOnboarding).toBe(false);
  });

  it('setDialect updates the dialect', () => {
    usePreferencesStore.getState().setDialect('tarifit');
    expect(usePreferencesStore.getState().dialect).toBe('tarifit');
  });

  it('setUiLanguage updates the UI language', () => {
    usePreferencesStore.getState().setUiLanguage('en');
    expect(usePreferencesStore.getState().uiLanguage).toBe('en');
  });

  it('setLearningGoal and setDailyGoalMinutes update goals', () => {
    usePreferencesStore.getState().setLearningGoal('culture');
    usePreferencesStore.getState().setDailyGoalMinutes(20);
    const state = usePreferencesStore.getState();
    expect(state.learningGoal).toBe('culture');
    expect(state.dailyGoalMinutes).toBe(20);
  });

  it('completeOnboarding and resetOnboarding toggle the flag', () => {
    usePreferencesStore.getState().completeOnboarding();
    expect(usePreferencesStore.getState().hasCompletedOnboarding).toBe(true);
    usePreferencesStore.getState().resetOnboarding();
    expect(usePreferencesStore.getState().hasCompletedOnboarding).toBe(false);
  });
});

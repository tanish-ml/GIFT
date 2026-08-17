const encode = (data) => btoa(JSON.stringify(data));
const decode = (str) => {
    try {
        return JSON.parse(atob(str));
    } catch {
        return null;
    }
};

const STATE_KEY = '_stage_progress';
const DEV_MODE_KEY = '_dev_mode';

if (!sessionStorage.getItem(STATE_KEY)) {
    sessionStorage.setItem(STATE_KEY, encode({ highestUnlockedStage: 1, answers: {} }));
}

export function getState() {
    return decode(sessionStorage.getItem(STATE_KEY)) || { highestUnlockedStage: 1, answers: {} };
}

export function saveState(state) {
    sessionStorage.setItem(STATE_KEY, encode(state));
}

export function getHighestUnlockedStage() {
    if (isDevModeActive()) return 99;
    const state = getState();
    return state.highestUnlockedStage || 1;
}

export function unlockStage(stageNum) {
    const state = getState();
    if (stageNum > state.highestUnlockedStage) {
        state.highestUnlockedStage = stageNum;
        saveState(state);
    }
}

export function saveAnswer(questionKey, answerValue) {
    const state = getState();
    if (!state.answers) state.answers = {};
    state.answers[questionKey] = answerValue;
    saveState(state);
}

export function getAnswer(questionKey) {
    const state = getState();
    return state.answers ? state.answers[questionKey] : null;
}

export function isDevModeActive() {
    return sessionStorage.getItem(DEV_MODE_KEY) === 'true';
}

export function toggleDevMode() {
    const current = isDevModeActive();
    sessionStorage.setItem(DEV_MODE_KEY, (!current).toString());
    return !current;
}

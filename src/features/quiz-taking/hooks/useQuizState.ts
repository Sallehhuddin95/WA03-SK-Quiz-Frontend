import { useReducer, useCallback, useEffect } from "react";
import type {
  QuizState,
  QuizAction,
  AnswerDraft,
  AnswerData,
  QuizResult,
} from "../types";

function getSessionKey(attemptId: number): string {
  return `sk_quiz_jawapan_${attemptId}`;
}

function saveToSession(attemptId: number, answerDraft: AnswerDraft) {
  try {
    sessionStorage.setItem(
      getSessionKey(attemptId),
      JSON.stringify(answerDraft)
    );
  } catch {
    // sessionStorage mungkin penuh atau tidak tersedia
  }
}

function loadFromSession(attemptId: number): AnswerDraft | null {
  try {
    const stored = sessionStorage.getItem(getSessionKey(attemptId));
    if (stored) return JSON.parse(stored);
  } catch {
    // data rosak
  }
  return null;
}

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_ANSWER": {
      const answerDraft = {
        ...state.answerDraft,
        [action.questionId]: state.answerDraft[action.questionId]
          ? {
              ...state.answerDraft[action.questionId],
              data_jawapan: action.data_jawapan,
            }
          : {
              ...state.answerDraft[action.questionId],
              data_jawapan: action.data_jawapan,
            },
      };
      return { ...state, answerDraft };
    }
    case "CLEAR_ANSWER": {
      const answerDraft = {
        ...state.answerDraft,
        [action.questionId]: {
          ...state.answerDraft[action.questionId],
          data_jawapan: null,
        },
      };
      return { ...state, answerDraft };
    }
    case "NAVIGATE":
      return { ...state, currentQuestionIndex: action.index };
    case "TOGGLE_SUBMIT_DIALOG":
      return { ...state, showSubmitDialog: action.open };
    case "START_SUBMIT":
      return { ...state, mode: "menghantar", submitError: null };
    case "SUBMIT_ERROR":
      return {
        ...state,
        mode: "menjawab",
        submitError: action.message,
      };
    case "COMPLETE":
      return {
        ...state,
        mode: "keputusan" as const,
        result: action.result,
      };
    case "SET_MODE_ANSWERING":
      return { ...state, mode: "menjawab" };
    default:
      return state;
  }
}

const initialState: QuizState = {
  mode: "memuat",
  answerDraft: {},
  currentQuestionIndex: 0,
  showSubmitDialog: false,
  submitError: null,
  result: null,
};

export function useQuizState(attemptId: number) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Load answers from sessionStorage on init
  useEffect(() => {
    const saved = loadFromSession(attemptId);
    if (saved) {
      for (const [qId, draft] of Object.entries(saved)) {
        if (draft.data_jawapan) {
          dispatch({
            type: "SET_ANSWER",
            questionId: Number(qId),
            data_jawapan: draft.data_jawapan as AnswerData,
          });
        }
      }
      dispatch({ type: "SET_MODE_ANSWERING" });
    }
  }, [attemptId]);

  // Save to sessionStorage whenever answers change
  useEffect(() => {
    if (Object.keys(state.answerDraft).length > 0) {
      saveToSession(attemptId, state.answerDraft);
    }
  }, [attemptId, state.answerDraft]);

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(getSessionKey(attemptId));
    } catch {
      // ignore
    }
  }, [attemptId]);

  const answeredCount = Object.values(state.answerDraft).filter(
    (d) => d.data_jawapan !== null
  ).length;

  return {
    state,
    dispatch,
    answeredCount,
    clearSession,
  };
}

import { AnalysisResult } from "./types";

let history: AnalysisResult[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getHistory() {
  return history;
}

export function addResult(result: AnalysisResult) {
  history = [result, ...history];
  notify();
}

export function setFeedback(id: string, feedback: "up" | "down") {
  history = history.map((r) => (r.id === id ? { ...r, feedback } : r));
  notify();
}

export function analyzeText(text: string): Promise<AnalysisResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rand = Math.random();
      let label: AnalysisResult["label"];
      let score: number;

      if (rand < 0.4) {
        label = "Likely Fake";
        score = Math.round((60 + Math.random() * 35) * 10) / 10;
      } else if (rand < 0.8) {
        label = "Likely Real";
        score = Math.round((60 + Math.random() * 35) * 10) / 10;
      } else {
        label = "Uncertain";
        score = Math.round((40 + Math.random() * 20) * 10) / 10;
      }

      const result: AnalysisResult = {
        id: crypto.randomUUID(),
        text,
        label,
        score,
        timestamp: new Date(),
      };

      addResult(result);
      resolve(result);
    }, 1500 + Math.random() * 1000);
  });
}
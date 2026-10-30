/**
 * The universal situational-judgment question bank for the scenario assessment.
 *
 * Each option carries two loadings:
 *  - `weights` — keyed effectiveness on each of the five soft competencies
 *    (0–10, used for role matching). Like any SJT key, some responses are more
 *    effective than others, so a strong answer pattern can score well on
 *    several competencies at once; scoring normalizes every dimension against
 *    the lowest/highest total the bank allows (integrity/scenario-scoring.ts).
 *  - `traits` — which Big Five / Integrity tendency the choice expresses. These
 *    are descriptive, not "better/worse": no option is globally best on traits,
 *    and trait levels are reported as bands, never as 0 or 100.
 *
 * Integrity of delivery:
 *  - Loadings never leave the server — the runner receives `{ id, text }` only
 *    (toPublicQuestions) and the server scores by option id.
 *  - Option order is shuffled per attempt on the server (seeded, so SSR and
 *    hydration agree). Option ids don't follow quality: the most effective
 *    response sits under a different id from question to question.
 *  - Submissions must answer every question with a valid option id.
 */

import type { ScenarioQuestion } from "../scenario/types";

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: "q1",
    prompt:
      "A teammate's work is running late and it's now blocking yours, with a deadline tomorrow. What are you most likely to do?",
    options: [
      {
        id: "a",
        text: "Loop in your manager so priorities can be adjusted across the team.",
        weights: { Communication: 5, Collaboration: 3, Ownership: 3, Adaptability: 4, "Problem-solving": 3 },
        traits: { Conscientiousness: 5, Agreeableness: 4 },
      },
      {
        id: "b",
        text: "Keep your own commitments on track and let them handle their piece.",
        weights: { Communication: 1, Collaboration: 1, Ownership: 5, Adaptability: 2, "Problem-solving": 2 },
        traits: { Conscientiousness: 6, "Emotional stability": 5 },
      },
      {
        id: "c",
        text: "Message them to understand the holdup and offer to pair on it.",
        weights: { Communication: 7, Collaboration: 9, Ownership: 6, Adaptability: 5, "Problem-solving": 5 },
        traits: { Agreeableness: 8, Extraversion: 6 },
      },
      {
        id: "d",
        text: "Re-plan your part around the blocker and flag the risk early.",
        weights: { Communication: 6, Collaboration: 4, Ownership: 8, Adaptability: 9, "Problem-solving": 6 },
        traits: { Conscientiousness: 7, "Emotional stability": 6 },
      },
    ],
  },
  {
    id: "q2",
    prompt: "You realize a mistake you made last week is now affecting a customer. What's your instinct?",
    options: [
      {
        id: "a",
        text: "Assess the real scale of impact first, then decide who needs to know.",
        weights: { Communication: 3, Collaboration: 2, Ownership: 4, Adaptability: 6, "Problem-solving": 6 },
        traits: { "Emotional stability": 7, Integrity: 4 },
      },
      {
        id: "b",
        text: "Flag it openly right away, explain the impact, and propose a fix and prevention.",
        weights: { Communication: 9, Collaboration: 6, Ownership: 10, Adaptability: 5, "Problem-solving": 7 },
        traits: { Integrity: 9, Conscientiousness: 6 },
      },
      {
        id: "c",
        text: "Fix it quickly and quietly, then log what happened.",
        weights: { Communication: 2, Collaboration: 2, Ownership: 6, Adaptability: 5, "Problem-solving": 7 },
        traits: { Conscientiousness: 7, Integrity: 3 },
      },
      {
        id: "d",
        text: "Trace how the process allowed it and raise that with the team.",
        weights: { Communication: 6, Collaboration: 6, Ownership: 5, Adaptability: 4, "Problem-solving": 9 },
        traits: { Openness: 7, Conscientiousness: 5 },
      },
    ],
  },
  {
    id: "q3",
    prompt: "Priorities change mid-week and half of your plan is suddenly irrelevant. You…",
    options: [
      {
        id: "a",
        text: "Ask for the reasoning so it makes sense and you can carry it to others.",
        weights: { Communication: 9, Collaboration: 6, Ownership: 4, Adaptability: 6, "Problem-solving": 4 },
        traits: { Openness: 6, Extraversion: 6, Agreeableness: 5 },
      },
      {
        id: "b",
        text: "Protect the highest-value work already in flight, then switch.",
        weights: { Communication: 3, Collaboration: 3, Ownership: 7, Adaptability: 5, "Problem-solving": 6 },
        traits: { Conscientiousness: 7, "Emotional stability": 5 },
      },
      {
        id: "c",
        text: "Voice your concern about the churn before you commit to the change.",
        weights: { Communication: 5, Collaboration: 2, Ownership: 3, Adaptability: 1, "Problem-solving": 2 },
        traits: { Conscientiousness: 5, Agreeableness: 2 },
      },
      {
        id: "d",
        text: "Re-sequence quickly, salvage what's reusable, and confirm the new top priority.",
        weights: { Communication: 6, Collaboration: 4, Ownership: 7, Adaptability: 10, "Problem-solving": 7 },
        traits: { Openness: 7, Conscientiousness: 6 },
      },
    ],
  },
  {
    id: "q4",
    prompt: "You disagree with a decision your team is about to make. How do you handle it?",
    options: [
      {
        id: "a",
        text: "Lay out your reasoning and the trade-offs, then commit to the group's call.",
        weights: { Communication: 9, Collaboration: 9, Ownership: 6, Adaptability: 6, "Problem-solving": 6 },
        traits: { Agreeableness: 7, Integrity: 6, Conscientiousness: 5 },
      },
      {
        id: "b",
        text: "Get behind the decision and focus on making it succeed.",
        weights: { Communication: 2, Collaboration: 7, Ownership: 6, Adaptability: 6, "Problem-solving": 2 },
        traits: { Agreeableness: 6, "Emotional stability": 6 },
      },
      {
        id: "c",
        text: "Propose a small, low-cost experiment to test both options.",
        weights: { Communication: 6, Collaboration: 6, Ownership: 5, Adaptability: 7, "Problem-solving": 10 },
        traits: { Openness: 8 },
      },
      {
        id: "d",
        text: "Raise it privately with the decision-maker before the meeting.",
        weights: { Communication: 5, Collaboration: 2, Ownership: 3, Adaptability: 3, "Problem-solving": 3 },
        traits: { Agreeableness: 5, Extraversion: 2 },
      },
    ],
  },
  {
    id: "q5",
    prompt: "A problem lands that nobody clearly owns. What do you do?",
    options: [
      {
        id: "a",
        text: "Clarify ownership with the team so it's handled deliberately.",
        weights: { Communication: 8, Collaboration: 6, Ownership: 4, Adaptability: 3, "Problem-solving": 3 },
        traits: { Agreeableness: 6, Conscientiousness: 4 },
      },
      {
        id: "b",
        text: "Break it down to the root cause before anyone acts.",
        weights: { Communication: 3, Collaboration: 2, Ownership: 5, Adaptability: 2, "Problem-solving": 9 },
        traits: { Openness: 7, Conscientiousness: 6 },
      },
      {
        id: "c",
        text: "Pick it up, scope it, and pull in the right people.",
        weights: { Communication: 6, Collaboration: 7, Ownership: 10, Adaptability: 6, "Problem-solving": 7 },
        traits: { Conscientiousness: 7, Extraversion: 6 },
      },
      {
        id: "d",
        text: "Handle the urgent part now and assign the rest afterward.",
        weights: { Communication: 4, Collaboration: 4, Ownership: 7, Adaptability: 8, "Problem-solving": 5 },
        traits: { "Emotional stability": 6, Conscientiousness: 5 },
      },
    ],
  },
  {
    id: "q6",
    prompt: "A new colleague is clearly struggling but hasn't asked for help. What feels natural?",
    options: [
      {
        id: "a",
        text: "Give them room to work it out, and step in if a real blocker appears.",
        weights: { Communication: 2, Collaboration: 3, Ownership: 2, Adaptability: 7, "Problem-solving": 3 },
        traits: { "Emotional stability": 6, Extraversion: 2 },
      },
      {
        id: "b",
        text: "Check in privately, listen, and offer specific help.",
        weights: { Communication: 8, Collaboration: 10, Ownership: 6, Adaptability: 5, "Problem-solving": 5 },
        traits: { Agreeableness: 8, Integrity: 5 },
      },
      {
        id: "c",
        text: "Share a resource or shortcut that worked for you.",
        weights: { Communication: 4, Collaboration: 6, Ownership: 3, Adaptability: 4, "Problem-solving": 7 },
        traits: { Openness: 6, Extraversion: 3 },
      },
      {
        id: "d",
        text: "Create an easy opening for them to ask, without singling them out.",
        weights: { Communication: 7, Collaboration: 7, Ownership: 3, Adaptability: 5, "Problem-solving": 3 },
        traits: { Agreeableness: 6, "Emotional stability": 5 },
      },
    ],
  },
];

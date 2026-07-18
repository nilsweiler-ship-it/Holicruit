/**
 * The universal situational-judgment question bank for the scenario assessment.
 *
 * Design principles (so scores can't be gamed):
 *  - Every option is a plausible, defensible choice — there is no obvious
 *    "correct" answer and no throwaway "do nothing" option.
 *  - Options reveal *behavioral tendency* (which Big Five / Integrity trait a
 *    choice expresses), not competence at picking the "right" answer. This is
 *    the format shown to have lower adverse impact and higher fake-resistance.
 *  - Option order is shuffled at render time, so position never cues an answer.
 *
 * Each option carries two loadings: `weights` (soft competencies, used for
 * role matching) and `traits` (the Big Five + Integrity personality profile).
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
        text: "Message them to understand the holdup and offer to pair on it.",
        weights: { Collaboration: 8, Communication: 6 },
        traits: { Agreeableness: 8, Extraversion: 6 },
      },
      {
        id: "b",
        text: "Re-plan your part around the blocker and flag the risk early.",
        weights: { Adaptability: 8, Ownership: 6 },
        traits: { Conscientiousness: 7, "Emotional stability": 6 },
      },
      {
        id: "c",
        text: "Loop in your manager so priorities can be adjusted across the team.",
        weights: { Communication: 6 },
        traits: { Conscientiousness: 5, Agreeableness: 4 },
      },
      {
        id: "d",
        text: "Keep your own commitments on track and let them handle their piece.",
        weights: { Ownership: 7 },
        traits: { Conscientiousness: 6, "Emotional stability": 5 },
      },
    ],
  },
  {
    id: "q2",
    prompt: "You realize a mistake you made last week is now affecting a customer. What's your instinct?",
    options: [
      {
        id: "a",
        text: "Flag it openly right away, explain the impact, and propose a fix and prevention.",
        weights: { Ownership: 8, Communication: 7 },
        traits: { Integrity: 9, Conscientiousness: 6 },
      },
      {
        id: "b",
        text: "Fix it quickly and quietly, then log what happened.",
        weights: { "Problem-solving": 7, Ownership: 5 },
        traits: { Conscientiousness: 7, Integrity: 3 },
      },
      {
        id: "c",
        text: "Trace how the process allowed it and raise that with the team.",
        weights: { "Problem-solving": 8 },
        traits: { Openness: 7, Conscientiousness: 5 },
      },
      {
        id: "d",
        text: "Assess the real scale of impact first, then decide who needs to know.",
        weights: { Adaptability: 6 },
        traits: { "Emotional stability": 7, Integrity: 4 },
      },
    ],
  },
  {
    id: "q3",
    prompt: "Priorities change mid-week and half of your plan is suddenly irrelevant. You…",
    options: [
      {
        id: "a",
        text: "Re-sequence quickly, salvage what's reusable, and confirm the new top priority.",
        weights: { Adaptability: 9, "Problem-solving": 6 },
        traits: { Openness: 7, Conscientiousness: 6 },
      },
      {
        id: "b",
        text: "Ask for the reasoning so it makes sense and you can carry it to others.",
        weights: { Communication: 7, Adaptability: 5 },
        traits: { Openness: 6, Extraversion: 6, Agreeableness: 5 },
      },
      {
        id: "c",
        text: "Protect the highest-value work already in flight, then switch.",
        weights: { Ownership: 7 },
        traits: { Conscientiousness: 7, "Emotional stability": 5 },
      },
      {
        id: "d",
        text: "Voice your concern about the churn before you commit to the change.",
        weights: { Communication: 6 },
        traits: { Conscientiousness: 5, Agreeableness: 2 },
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
        weights: { Communication: 8, Collaboration: 7 },
        traits: { Agreeableness: 7, Integrity: 6, Conscientiousness: 5 },
      },
      {
        id: "b",
        text: "Propose a small, low-cost experiment to test both options.",
        weights: { "Problem-solving": 9, Adaptability: 5 },
        traits: { Openness: 8 },
      },
      {
        id: "c",
        text: "Raise it privately with the decision-maker before the meeting.",
        weights: { Communication: 6 },
        traits: { Agreeableness: 5, Extraversion: 2 },
      },
      {
        id: "d",
        text: "Get behind the decision and focus on making it succeed.",
        weights: { Collaboration: 7, Ownership: 5 },
        traits: { Agreeableness: 6, "Emotional stability": 6 },
      },
    ],
  },
  {
    id: "q5",
    prompt: "A problem lands that nobody clearly owns. What do you do?",
    options: [
      {
        id: "a",
        text: "Pick it up, scope it, and pull in the right people.",
        weights: { Ownership: 9, Collaboration: 6 },
        traits: { Conscientiousness: 7, Extraversion: 6 },
      },
      {
        id: "b",
        text: "Break it down to the root cause before anyone acts.",
        weights: { "Problem-solving": 9 },
        traits: { Openness: 7, Conscientiousness: 6 },
      },
      {
        id: "c",
        text: "Clarify ownership with the team so it's handled deliberately.",
        weights: { Communication: 7 },
        traits: { Agreeableness: 6, Conscientiousness: 4 },
      },
      {
        id: "d",
        text: "Handle the urgent part now and assign the rest afterward.",
        weights: { Adaptability: 7, Ownership: 5 },
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
        text: "Check in privately, listen, and offer specific help.",
        weights: { Collaboration: 9, Communication: 6 },
        traits: { Agreeableness: 8, Integrity: 5 },
      },
      {
        id: "b",
        text: "Share a resource or shortcut that worked for you.",
        weights: { "Problem-solving": 6, Collaboration: 5 },
        traits: { Openness: 6, Extraversion: 3 },
      },
      {
        id: "c",
        text: "Create an easy opening for them to ask, without singling them out.",
        weights: { Communication: 7 },
        traits: { Agreeableness: 6, "Emotional stability": 5 },
      },
      {
        id: "d",
        text: "Give them room to work it out, and step in if a real blocker appears.",
        weights: { Adaptability: 6 },
        traits: { "Emotional stability": 6, Extraversion: 2 },
      },
    ],
  },
];

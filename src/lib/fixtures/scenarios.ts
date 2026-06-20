/**
 * The universal situational-judgment question bank for the soft-skill scenario
 * assessment. Every prompt is deliberately domain-agnostic — it describes a
 * workplace situation any role in any industry faces — so the assessment
 * measures behavior, not field-specific knowledge.
 */

import type { ScenarioQuestion } from "../scenario/types";

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: "q1",
    prompt:
      "A teammate's work is late and it's blocking yours. A deadline is tomorrow. What do you do first?",
    options: [
      {
        id: "a",
        text: "Message them to understand the holdup and offer to pair on it.",
        weights: { Collaboration: 9, Communication: 8 },
      },
      {
        id: "b",
        text: "Re-plan your part to make progress on what isn't blocked, then flag the risk early.",
        weights: { Adaptability: 9, Ownership: 7 },
      },
      {
        id: "c",
        text: "Escalate to your manager so they can reprioritize.",
        weights: { Communication: 5, Ownership: 3 },
      },
      {
        id: "d",
        text: "Wait — it's their task, not yours.",
        weights: { Ownership: 1 },
      },
    ],
  },
  {
    id: "q2",
    prompt: "You realize a mistake you made last week is now affecting a customer. What's your move?",
    options: [
      {
        id: "a",
        text: "Own it openly, explain the impact, and propose a concrete fix and prevention.",
        weights: { Ownership: 10, Communication: 8 },
      },
      {
        id: "b",
        text: "Quietly fix it before anyone notices.",
        weights: { Ownership: 4, "Problem-solving": 4 },
      },
      {
        id: "c",
        text: "Check whether the process let it happen and raise that too.",
        weights: { "Problem-solving": 8, Ownership: 6 },
      },
      {
        id: "d",
        text: "Wait to see if it actually causes a problem.",
        weights: { Ownership: 1 },
      },
    ],
  },
  {
    id: "q3",
    prompt: "Priorities just changed mid-week and half your plan is now irrelevant. You…",
    options: [
      {
        id: "a",
        text: "Re-sequence quickly, salvage reusable work, and confirm the new top priority.",
        weights: { Adaptability: 10, "Problem-solving": 7 },
      },
      {
        id: "b",
        text: "Ask for the 'why' so the change makes sense and you can carry it to others.",
        weights: { Communication: 8, Adaptability: 6 },
      },
      {
        id: "c",
        text: "Finish what you started first — switching now wastes effort.",
        weights: { Adaptability: 2, Ownership: 4 },
      },
      {
        id: "d",
        text: "Push back hard until the original plan is restored.",
        weights: { Adaptability: 1 },
      },
    ],
  },
  {
    id: "q4",
    prompt: "You disagree with a decision your team is about to make. How do you handle it?",
    options: [
      {
        id: "a",
        text: "Lay out your reasoning and the trade-offs, then commit to whatever the group decides.",
        weights: { Communication: 9, Collaboration: 8 },
      },
      {
        id: "b",
        text: "Propose a small experiment to test both options.",
        weights: { "Problem-solving": 9, Adaptability: 6 },
      },
      {
        id: "c",
        text: "Go along quietly to keep the peace.",
        weights: { Collaboration: 3 },
      },
      {
        id: "d",
        text: "Insist on your view until they agree.",
        weights: { Collaboration: 1 },
      },
    ],
  },
  {
    id: "q5",
    prompt: "A problem lands on your desk that nobody clearly owns. You…",
    options: [
      {
        id: "a",
        text: "Pick it up, scope it, and pull in the right people.",
        weights: { Ownership: 10, Collaboration: 7 },
      },
      {
        id: "b",
        text: "Break it down to find the root cause before acting.",
        weights: { "Problem-solving": 10, Ownership: 6 },
      },
      {
        id: "c",
        text: "Find whose job it most likely is and hand it over.",
        weights: { Communication: 4, Ownership: 2 },
      },
      {
        id: "d",
        text: "Leave it — someone will pick it up.",
        weights: { Ownership: 1 },
      },
    ],
  },
  {
    id: "q6",
    prompt: "A new colleague is struggling but hasn't asked for help. What do you do?",
    options: [
      {
        id: "a",
        text: "Check in privately, listen, and offer specific help.",
        weights: { Collaboration: 10, Communication: 8 },
      },
      {
        id: "b",
        text: "Share a resource or a shortcut that solved it for you.",
        weights: { "Problem-solving": 7, Collaboration: 6 },
      },
      {
        id: "c",
        text: "Wait for them to ask — people learn by struggling.",
        weights: { Collaboration: 2 },
      },
      {
        id: "d",
        text: "Mention it to their manager.",
        weights: { Communication: 3 },
      },
    ],
  },
];

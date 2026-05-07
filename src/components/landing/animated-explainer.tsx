"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
} from "framer-motion";
import {
  Eye,
  Scale,
  UserX,
  BadgeDollarSign,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const traditionalSteps = [
  {
    label: "Hiring Manager",
    signal: 100,
    color: "bg-emerald-500",
    barColor: "bg-emerald-500",
    description: "Defines precise technical requirements with deep domain knowledge",
    lost: null,
  },
  {
    label: "HR Department",
    signal: 65,
    color: "bg-yellow-500",
    barColor: "bg-yellow-500",
    description: "Rewrites into a generic job posting — technical nuance stripped away",
    lost: "Domain expertise lost",
  },
  {
    label: "Recruiting Agency",
    signal: 35,
    color: "bg-orange-500",
    barColor: "bg-orange-500",
    description: "Simplifies to keyword matching — they're not experts in your field",
    lost: "Context & priorities lost",
  },
  {
    label: "Candidates",
    signal: 15,
    color: "bg-red-500",
    barColor: "bg-red-500",
    description: "Receive a watered-down brief, apply blindly into a void",
    lost: "Specificity lost entirely",
  },
];

const holicruitSteps = [
  {
    label: "Hiring Manager",
    signal: 100,
    description: "Defines exact skills, proficiency levels, and weights — directly",
  },
  {
    label: "Matched Candidates",
    signal: 100,
    description: "Scored objectively against the real criteria — no signal loss",
  },
];

const usps = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Every score is explained. Every decision is visible. No black boxes.",
  },
  {
    icon: Scale,
    title: "Objectivity",
    description:
      "Skills measured against expert-defined criteria — not a recruiter's gut feeling.",
  },
  {
    icon: UserX,
    title: "No Middleman",
    description:
      "Domain experts set requirements directly. No detour through non-experts who dilute your needs.",
  },
  {
    icon: BadgeDollarSign,
    title: "Lower Costs",
    description:
      "No recruiter fees for mismatched candidates. Pay only for what works.",
  },
  {
    icon: Zap,
    title: "Faster Hiring",
    description:
      "From role definition to ranked shortlist in days, not months.",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const uspContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const uspItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SignalBar({
  percent,
  barColor,
}: {
  percent: number;
  barColor: string;
}) {
  return (
    <div className="h-3 w-full rounded-full bg-muted">
      <motion.div
        className={`h-full rounded-full ${barColor}`}
        initial={{ width: "100%" }}
        whileInView={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true }}
      />
    </div>
  );
}

function ConnectorArrow() {
  return (
    <motion.div
      className="flex items-center justify-center py-2"
      variants={itemVariants}
    >
      <motion.div
        className="h-8 w-0.5 bg-primary"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        style={{ originY: 0 }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AnimatedExplainer() {
  const problemRef = useRef(null);
  const solutionRef = useRef(null);
  const uspRef = useRef(null);

  const problemInView = useInView(problemRef, { once: true, margin: "-80px" });
  const solutionInView = useInView(solutionRef, {
    once: true,
    margin: "-80px",
  });
  const uspInView = useInView(uspRef, { once: true, margin: "-80px" });

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        {/* ---- Section 1: The Problem ---- */}
        <div ref={problemRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-destructive">
              The problem
            </p>
            <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
              Lost in Translation
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Every hand-off strips away the domain knowledge that matters most.
              By the time candidates see your role, the real requirements are
              gone.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={problemInView ? "visible" : "hidden"}
            className="space-y-1"
          >
            {traditionalSteps.map((step, i) => (
              <div key={step.label}>
                <motion.div
                  variants={itemVariants}
                  className="rounded-lg border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${step.color}`}
                        >
                          {i + 1}
                        </span>
                        <span className="font-semibold">{step.label}</span>
                        {step.lost && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            viewport={{ once: true }}
                            className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive"
                          >
                            {step.lost}
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
                          Signal: {step.signal}%
                        </span>
                        <SignalBar
                          percent={step.signal}
                          barColor={step.barColor}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
                {i < traditionalSteps.length - 1 && <ConnectorArrow />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ---- Section 2: The Holicruit Way ---- */}
        <div ref={solutionRef} className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={solutionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              The Holicruit way
            </p>
            <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
              Direct. Zero Signal Loss.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              No HR rewriting your specs. No recruiter guessing at what matters.
              The hiring manager&apos;s expertise goes straight to the scoring
              engine.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={solutionInView ? "visible" : "hidden"}
            className="space-y-1"
          >
            {holicruitSteps.map((step, i) => (
              <div key={step.label}>
                <motion.div
                  variants={itemVariants}
                  className="rounded-lg border-2 border-primary/30 bg-card p-5"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="font-semibold">{step.label}</span>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        viewport={{ once: true }}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        100% signal preserved
                      </motion.span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
                        Signal: {step.signal}%
                      </span>
                      <SignalBar percent={step.signal} barColor="bg-primary" />
                    </div>
                  </div>
                </motion.div>
                {i < holicruitSteps.length - 1 && (
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-center py-2"
                  >
                    <motion.div
                      className="h-8 w-0.5 bg-primary"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                      style={{ originY: 0 }}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ---- Section 3: USP Cards ---- */}
        <div ref={uspRef} className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={uspInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
              Why This Matters
            </h2>
          </motion.div>

          <motion.div
            variants={uspContainerVariants}
            initial="hidden"
            animate={uspInView ? "visible" : "hidden"}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {usps.map((usp) => (
              <motion.div
                key={usp.title}
                variants={uspItemVariants}
                className="rounded-lg border bg-card p-5 space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <usp.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{usp.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {usp.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { describe, it, expect } from "vitest";
import { HM_PLANS, HH_PLANS } from "@/lib/plans";

describe("Plan definitions", () => {
  it("has three HM plan tiers", () => {
    expect(Object.keys(HM_PLANS)).toEqual(["STARTER", "PROFESSIONAL", "ENTERPRISE"]);
  });

  it("has two HH plan tiers", () => {
    expect(Object.keys(HH_PLANS)).toEqual(["FREE", "PRO"]);
  });

  it("STARTER plan is free with limited features", () => {
    const plan = HM_PLANS.STARTER;
    expect(plan.price).toBe(0);
    expect(plan.activeRoles).toBe(2);
    expect(plan.appsPerRole).toBe(10);
    expect(plan.gapAnalysis).toBe(false);
  });

  it("PROFESSIONAL plan has gap analysis enabled", () => {
    const plan = HM_PLANS.PROFESSIONAL;
    expect(plan.price).toBe(99);
    expect(plan.gapAnalysis).toBe(true);
    expect(plan.activeRoles).toBe(10);
  });

  it("ENTERPRISE plan has unlimited everything", () => {
    const plan = HM_PLANS.ENTERPRISE;
    expect(plan.price).toBe(299);
    expect(plan.activeRoles).toBe(-1);
    expect(plan.appsPerRole).toBe(-1);
    expect(plan.teamMembers).toBe(-1);
  });

  it("HH FREE plan has limited claims and submissions", () => {
    const plan = HH_PLANS.FREE;
    expect(plan.price).toBe(0);
    expect(plan.roleClaims).toBe(3);
    expect(plan.monthlySubmissions).toBe(10);
  });

  it("HH PRO plan has unlimited access", () => {
    const plan = HH_PLANS.PRO;
    expect(plan.price).toBe(49);
    expect(plan.roleClaims).toBe(-1);
    expect(plan.monthlySubmissions).toBe(-1);
  });
});

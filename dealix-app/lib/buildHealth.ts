import type { Build, TaskItem, TestingResult } from "@/types";

export type BuildHealthState = "Ready" | "Needs attention" | "Blocked" | "Not assessed";

export interface BuildHealthAnalysis {
  score: number;
  state: BuildHealthState;
  headline: string;
  nextStep: string;
  reasons: string[];
}

const coreParts: Array<[keyof Build, string]> = [["cpu", "CPU"], ["gpu", "GPU"], ["motherboard", "motherboard"], ["ram", "RAM"], ["storage", "storage"], ["psu", "PSU"], ["case", "case"]];

export function analyzeBuildHealth(build: Build, tasks: TaskItem[], testing?: TestingResult): BuildHealthAnalysis {
  const reasons: string[] = [];
  const missingCore = coreParts.filter(([key]) => !String(build[key] ?? "").trim()).map(([, label]) => label);
  const needed = build.partsNeeded?.filter((part) => part.status !== "Resolved") ?? [];
  const highPriority = needed.filter((part) => part.priority === "High");
  const activeTasks = tasks.filter((task) => task.buildId === build.id && !task.completed && task.status !== "Completed");
  const completedChecks = testing?.checklist.filter((check) => check.done).length ?? 0;
  const totalChecks = testing?.checklist.length ?? 0;
  const failedPart = testing?.failedPart?.trim();

  let score = 100;
  if (missingCore.length) { score -= Math.min(28, missingCore.length * 5); reasons.push(`Missing build details: ${missingCore.join(", ")}.`); }
  if (highPriority.length) { score -= Math.min(36, highPriority.length * 12); reasons.push(`${highPriority.length} high-priority missing part${highPriority.length === 1 ? "" : "s"} block completion.`); }
  const otherNeeded = needed.length - highPriority.length;
  if (otherNeeded) { score -= Math.min(12, otherNeeded * 4); reasons.push(`${otherNeeded} additional part${otherNeeded === 1 ? " remains" : "s remain"} to source.`); }
  if (failedPart) { score -= 35; reasons.push(`${failedPart} is marked as a failed component.`); }
  if (!testing) { score -= 18; reasons.push("Testing has not been recorded."); }
  else if (completedChecks < totalChecks) { score -= 14; reasons.push(`${totalChecks - completedChecks} testing check${totalChecks - completedChecks === 1 ? " is" : "s are"} still incomplete.`); }
  if (activeTasks.length) { score -= Math.min(15, activeTasks.length * 4); reasons.push(`${activeTasks.length} linked task${activeTasks.length === 1 ? " is" : "s are"} still open.`); }
  if (build.status === "Listed" && !build.listingPrice) { score -= 10; reasons.push("A listing price has not been recorded."); }

  score = Math.max(0, Math.min(100, score));
  if (build.status === "Sold") return { score: 100, state: "Ready", headline: "Sale complete", nextStep: "Keep the final payout and sale record up to date.", reasons: ["This build is marked sold; readiness checks are complete for the active workflow."] };
  if (failedPart || highPriority.length) return { score, state: "Blocked", headline: "A critical item is blocking progress", nextStep: failedPart ? `Repair or replace ${failedPart} before continuing.` : `Source ${highPriority[0]?.name} before moving this build forward.`, reasons };
  if (!testing) return { score, state: "Not assessed", headline: "Readiness has not been verified", nextStep: "Run the saved testing checklist to establish build readiness.", reasons };
  if (missingCore.length || needed.length || activeTasks.length || completedChecks < totalChecks || (build.status === "Listed" && !build.listingPrice)) return { score, state: "Needs attention", headline: "A few actions remain", nextStep: activeTasks[0]?.title ?? (completedChecks < totalChecks ? "Finish the remaining testing checks." : "Resolve the listed build details before listing."), reasons };
  return { score, state: "Ready", headline: "Ready for the next workflow step", nextStep: build.status === "Listed" ? "Monitor the listing and record offers." : "Create a listing when you are ready to sell.", reasons: ["Required build details are present.", "Saved testing is complete with no failed component.", "No missing parts or open linked tasks are recorded."] };
}

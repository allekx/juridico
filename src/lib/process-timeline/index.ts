import {
  PROCESS_TIMELINE_STEPS,
  getCurrentStepIndex,
  type ProcessStepState,
} from "@/constants/process-timeline";

export interface ProcessTimelineStep {
  id: string;
  label: string;
  description: string;
  state: ProcessStepState;
  completedAt: Date | null;
}

export interface BuildProcessTimelineInput {
  currentStatusSlug: string;
  isFinal?: boolean;
  openedAt?: Date;
  history?: Array<{ statusSlug: string; createdAt: Date }>;
  hearingDate?: Date | null;
}

export function buildProcessTimeline(
  input: BuildProcessTimelineInput
): ProcessTimelineStep[] {
  const {
    currentStatusSlug,
    isFinal = false,
    openedAt,
    history = [],
    hearingDate,
  } = input;

  const currentIndex = getCurrentStepIndex(currentStatusSlug, isFinal);

  const completedDates = new Map<string, Date>();

  if (openedAt) {
    completedDates.set(PROCESS_TIMELINE_STEPS[0].id, openedAt);
  }

  for (const entry of history) {
    const stepIndex = getCurrentStepIndex(entry.statusSlug);
    const step = PROCESS_TIMELINE_STEPS[stepIndex];
    if (!step) continue;

    const existing = completedDates.get(step.id);
    if (!existing || entry.createdAt < existing) {
      completedDates.set(step.id, entry.createdAt);
    }
  }

  if (hearingDate) {
    const hearingStep = PROCESS_TIMELINE_STEPS[4];
    const existing = completedDates.get(hearingStep.id);
    if (!existing || hearingDate < existing) {
      completedDates.set(hearingStep.id, hearingDate);
    }
  }

  return PROCESS_TIMELINE_STEPS.map((step, index) => {
    let state: ProcessStepState;

    if (isFinal || index < currentIndex) {
      state = "completed";
    } else if (index === currentIndex) {
      state = "current";
    } else {
      state = "pending";
    }

    return {
      id: step.id,
      label: step.label,
      description: step.description,
      state,
      completedAt: state === "completed" ? completedDates.get(step.id) ?? null : null,
    };
  });
}

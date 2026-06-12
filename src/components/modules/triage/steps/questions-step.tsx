"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/forms/form-field";
import { TRIAGE_QUESTIONS } from "@/constants/triage-questions";
import type { PracticeAreaSlug } from "@/constants/practice-areas";
import type { TriageQuestion } from "@/types/triage";

interface QuestionsStepProps {
  areaSlug: PracticeAreaSlug;
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: TriageQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `q-${question.key}`;

  switch (question.type) {
    case "textarea":
      return (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          required={question.required}
        />
      );

    case "select":
      return (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Selecione...</option>
          {question.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "radio":
    case "boolean":
      return (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-4 py-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name={id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                required={question.required}
                className="text-primary"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case "date":
      return (
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      );

    default:
      return (
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          required={question.required}
        />
      );
  }
}

export function QuestionsStep({
  areaSlug,
  answers,
  onChange,
}: QuestionsStepProps) {
  const questions = TRIAGE_QUESTIONS[areaSlug] ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {questions.map((question) => (
        <FormField
          key={question.key}
          label={question.label}
          htmlFor={`q-${question.key}`}
          required={question.required}
          hint={question.hint}
        >
          <QuestionField
            question={question}
            value={answers[question.key] ?? ""}
            onChange={(v) => onChange(question.key, v)}
          />
        </FormField>
      ))}
    </div>
  );
}

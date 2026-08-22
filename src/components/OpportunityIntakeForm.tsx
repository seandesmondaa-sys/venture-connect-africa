import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INTAKE_STAGES } from "@/lib/ac-framework";
import { submitOpportunityIntake } from "@/lib/opportunities.functions";

export function OpportunityIntakeForm({
  onSubmitted,
}: {
  onSubmitted: (opportunityId: string) => void;
}) {
  const submit = useServerFn(submitOpportunityIntake);
  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stage = INTAKE_STAGES[stageIndex]!;
  const isLast = stageIndex === INTAKE_STAGES.length - 1;

  const set = (key: string, value: string) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const next = async () => {
    setError(null);
    if (stageIndex === 0 && !answers["company_name"]?.trim()) {
      setError("Please tell us the name of your business or project.");
      return;
    }
    if (!isLast) {
      setStageIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPending(true);
    try {
      const result = await submit({ data: { answers } });
      onSubmitted(result.opportunityId);
    } catch {
      setError("Something went wrong submitting your opportunity. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div>
        <div className="flex items-center gap-1.5">
          {INTAKE_STAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= stageIndex ? "bg-gold" : "bg-secondary"}`}
            />
          ))}
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Stage {stageIndex + 1} of {INTAKE_STAGES.length}
        </p>
        <h2 className="mt-1 text-2xl">{stage.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{stage.hint}</p>
      </div>

      <div className="space-y-5">
        {stage.questions.map((question) => (
          <div key={question.key} className="space-y-2">
            <label htmlFor={question.key} className="block text-sm font-medium">
              {question.label}
            </label>
            {question.type === "long" ? (
              <Textarea
                id={question.key}
                rows={4}
                maxLength={4000}
                placeholder={question.placeholder}
                value={answers[question.key] ?? ""}
                onChange={(e) => set(question.key, e.target.value)}
              />
            ) : (
              <Input
                id={question.key}
                type={question.type === "number" ? "number" : "text"}
                maxLength={400}
                placeholder={question.placeholder}
                value={answers[question.key] ?? ""}
                onChange={(e) => set(question.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={stageIndex === 0 || pending}
          onClick={() => setStageIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        <Button type="button" variant="gold" disabled={pending} onClick={() => void next()}>
          {pending ? "Analysing…" : isLast ? "Submit for screening" : "Continue"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Answer what you can — our analysis flags anything missing and asks only about the gaps.
      </p>
    </div>
  );
}

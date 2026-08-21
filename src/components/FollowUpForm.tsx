import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { answerFollowUps } from "@/lib/opportunities.functions";

export type FollowUp = {
  id: string;
  question: string;
  rationale: string | null;
  answer: string | null;
};

export function FollowUpForm({
  opportunityId,
  questions,
  onAnswered,
}: {
  opportunityId: string;
  questions: FollowUp[];
  onAnswered: () => void;
}) {
  const submit = useServerFn(answerFollowUps);
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = questions.filter((q) => !q.answer);
  if (!open.length) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const answers = Object.entries(values)
      .filter(([, value]) => value.trim().length > 0)
      .map(([id, value]) => ({ id, answer: value.trim() }));
    if (!answers.length) {
      setError("Answer at least one question so we can re-score your opportunity.");
      return;
    }
    setPending(true);
    try {
      await submit({ data: { opportunityId, answers } });
      setValues({});
      onAnswered();
    } catch {
      setError("We couldn't save those answers. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <div>
        <h3 className="text-lg font-semibold">Only what&apos;s missing</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          These are the gaps our analysis found. Answering them re-scores your opportunity
          immediately.
        </p>
      </div>
      {open.map((question) => (
        <div key={question.id} className="space-y-2">
          <label htmlFor={question.id} className="block text-sm font-medium">
            {question.question}
          </label>
          {question.rationale ? (
            <p className="text-xs text-muted-foreground">{question.rationale}</p>
          ) : null}
          <Textarea
            id={question.id}
            rows={3}
            maxLength={3000}
            value={values[question.id] ?? ""}
            onChange={(e) => setValues((prev) => ({ ...prev, [question.id]: e.target.value }))}
          />
        </div>
      ))}
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Re-scoring…" : "Submit answers & re-score"}
      </Button>
    </form>
  );
}

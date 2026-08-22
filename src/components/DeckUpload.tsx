import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { analyzePitchDeckUpload } from "@/lib/opportunities.functions";

const ACCEPTED = ".pdf,application/pdf";

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

export function DeckUpload({ onAnalyzed }: { onAnalyzed: (opportunityId: string) => void }) {
  const analyze = useServerFn(analyzePitchDeckUpload);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > 15 * 1024 * 1024) {
      setError("That file is larger than 15MB. Please upload a smaller PDF.");
      return;
    }
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) {
      setError(
        "Please upload a PDF. If your deck is a PowerPoint file, export it to PDF first — the analysis is far more accurate.",
      );
      return;
    }
    setFileName(file.name);
    setPending(true);
    try {
      const base64 = await toBase64(file);
      const result = await analyze({
        data: { fileName: file.name, mimeType: file.type || "application/pdf", base64 },
      });
      onAnalyzed(result.opportunityId);
    } catch {
      setError("We couldn't analyse that deck. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <h3 className="text-lg font-semibold">Upload your pitch deck</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        We read the deck, map it onto the AC framework, mark what is confirmed, inferred or missing,
        and only ask you about the gaps. PDF up to 15MB.
      </p>
      {fileName ? <p className="mt-3 text-sm font-medium">{fileName}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-destructive">{error}</p> : null}
      <Button
        type="button"
        variant="gold"
        size="lg"
        className="mt-5"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? "Analysing your deck…" : "Choose a PDF"}
      </Button>
      {pending ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Reading, extracting and screening — this usually takes 20–40 seconds.
        </p>
      ) : null}
    </div>
  );
}

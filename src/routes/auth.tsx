import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const title = "Sign in — AC Intelligence";
const description =
  "Sign in to AC Intelligence to submit an opportunity, track your assessment or access the Auxilium Consult internal dashboard.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  component: AuthPage,
});

function safePath(path: string | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/submit";
  return path;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const destination = safePath(search.redirect);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: destination });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: destination });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [destination, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (signUpError) throw signUpError;
        setNotice("Account created. Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="surface-panel">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link
            to="/"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-surface-foreground"
          >
            AC <span className="text-gold">Intelligence</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-md px-5 py-14">
        <h1 className="text-3xl font-semibold text-foreground">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Opportunity assessments and the Auxilium dashboard hold confidential company data, so an
          account is required.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 card-elevated"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
          {notice ? <p className="text-sm font-medium text-foreground">{notice}</p> : null}

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={pending}>
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin"
              ? "No account yet? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

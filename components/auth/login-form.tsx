"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function LoginForm({ redirectedFrom }: { redirectedFrom?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ainoc.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSafeDestination = (value: string | null): Route => {
    if (value === "/dashboard" || value === "/slices" || value === "/functions" || value === "/alerts" || value === "/assistant") {
      return value;
    }

    return "/dashboard";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase environment variables are missing.");
      setIsSubmitting(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    const destination = getSafeDestination(redirectedFrom ?? null);
    router.replace(destination);
    router.refresh();
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Admin Access</p>
        <CardTitle className="mt-3 text-3xl">Sign in to AI-NOC</CardTitle>
        <CardDescription>Use the configured Supabase admin credentials to access the operations center.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="admin@ainoc.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

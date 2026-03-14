"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createBrowserSupabaseClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    setIsLoading(false);
    router.replace("/login");
    router.refresh();
  };

  return (
    <Button className="mt-6 w-full justify-start gap-3" variant="outline" onClick={handleLogout} disabled={isLoading}>
      <LogOut className="h-4 w-4" />
      {isLoading ? "Signing out..." : "Logout"}
    </Button>
  );
}

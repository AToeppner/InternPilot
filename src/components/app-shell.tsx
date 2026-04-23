import Link from "next/link";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications/new", label: "New Application" },
  { href: "/experience", label: "Experience Bank" },
  { href: "/tracker", label: "Tracker" },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground font-semibold">
              IP
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">InternPilot</div>
              <div className="text-xs text-muted-foreground">demo mode • single user</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="h-9">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground">
          <div>InternPilot — school demo (no auth, text-only)</div>
          <div className="hidden sm:block">Upload → Analyze → Match → Generate → Save</div>
        </div>
      </footer>
    </div>
  );
}


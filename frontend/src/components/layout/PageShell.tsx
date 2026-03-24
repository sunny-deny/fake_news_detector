import { ReactNode } from "react";
import AppHeader from "./AppHeader";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className={className}>{children}</main>
    </div>
  );
}
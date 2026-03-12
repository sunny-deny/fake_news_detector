import { Link, useLocation } from "react-router-dom";
import { History, Shield } from "lucide-react";

const navItems = [
  { label: "Analyze", to: "/" },
  { label: "History", to: "/history", icon: History },
];

export default function AppHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 transition-all group-hover:glow-primary">
            <Shield className="h-5 w-5 text-primary" />
          </div>

          <span className="text-lg font-semibold tracking-tight text-foreground">
            Truth<span className="text-primary">Lens</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ label, to, icon: Icon }) => {
            const isActive = location.pathname === to;

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
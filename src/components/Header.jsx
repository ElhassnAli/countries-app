import { Moon, Sun } from "lucide-react";

export default function Header({ darkMode, onToggleTheme, onHome }) {
  const ThemeIcon = darkMode ? Moon : Sun;

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" type="button" onClick={onHome}>
          Where in the world?
        </button>
        <button
          className="theme-toggle inline-flex items-center gap-2"
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color mode"
        >
          <ThemeIcon size={18} strokeWidth={darkMode ? 2 : 1.8} aria-hidden="true" />
          <span>Dark Mode</span>
        </button>
      </div>
    </header>
  );
}

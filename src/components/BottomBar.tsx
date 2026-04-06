// src/components/BottomBar.tsx
// La barre de navigation en bas de l'écran

import { useApp } from "../context/AppContext";

export function BottomBar() {
  const { sidebarOuverte, toggleSidebar } = useApp();

  return (
    <div
      className="flex items-center gap-1 px-3 h-10 flex-shrink-0"
      style={{
        background: "hsl(222, 25%, 8%)",
        borderTop: "1px solid hsl(220, 15%, 14%)",
      }}
    >
      {/* Bouton toggle sidebar */}
      <button
        onClick={toggleSidebar}
        title={sidebarOuverte ? "Masquer la sidebar" : "Afficher la sidebar"}
        className="flex items-center justify-center w-7 h-7 rounded transition-colors text-gray-500 hover:text-gray-300 hover:bg-white/8"
      >
        {/* Icône simple en SVG pour la sidebar */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect
            x="0"
            y="0"
            width="5"
            height="14"
            rx="1"
            opacity={sidebarOuverte ? "1" : "0.4"}
          />
          <rect x="7" y="0" width="7" height="2" rx="1" />
          <rect x="7" y="4" width="7" height="2" rx="1" />
          <rect x="7" y="8" width="7" height="2" rx="1" />
          <rect x="7" y="12" width="7" height="2" rx="1" />
        </svg>
      </button>

      {/* Séparateur */}
      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Onglet Research (seul onglet pour la v1) */}
      <button
        className="flex items-center gap-2 px-3 h-7 rounded text-sm font-medium transition-all"
        style={{
          background: "hsl(262, 40%, 25%)",
          border: "1px solid hsl(262, 40%, 35%)",
          color: "hsl(262, 80%, 85%)",
        }}
      >
        {/* Icône loupe */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="5" cy="5" r="4" />
          <line x1="8.5" y1="8.5" x2="11" y2="11" />
        </svg>
        Research
      </button>

      {/* Espace flexible */}
      <div className="flex-1" />

      {/* Version de l'app (discret, à droite) */}
      <span className="text-[11px] text-gray-700">ToneLab v1.0</span>
    </div>
  );
}

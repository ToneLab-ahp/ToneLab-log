// src/App.tsx
// Composant racine : assemble tous les éléments de l'interface

import { MenuBar } from "./components/MenuBar";
import { Sidebar } from "./components/Sidebar";
import { SoundResearchTool } from "./components/SoundResearchTool";
import { BottomBar } from "./components/BottomBar";

export default function App() {
  return (
    // "dark" active le mode sombre de Tailwind sur toute l'app
    // "h-screen" = 100% de la hauteur de l'écran
    // "flex flex-col" = disposition verticale (menu en haut, contenu, barre en bas)
    <div
      className="dark h-screen flex flex-col overflow-hidden"
      style={{ background: "hsl(222, 25%, 8%)" }}
    >
      {/* ── Barre de menu (fixe en haut) ── */}
      <MenuBar />

      {/* ── Zone centrale (prend tout l'espace disponible) ── */}
      {/* "flex-1" = grandit pour remplir l'espace entre menu et barre du bas */}
      {/* "min-h-0" est nécessaire pour que le scroll fonctionne correctement */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar gauche */}
        <Sidebar />

        {/* Zone de contenu principale */}
        {/* "flex-1" = prend tout l'espace à droite de la sidebar */}
        <main
          className="flex-1 flex min-w-0"
          style={{ background: "hsl(222, 22%, 9%)" }}
        >
          <SoundResearchTool />
        </main>
      </div>

      {/* ── Barre de navigation (fixe en bas) ── */}
      <BottomBar />
    </div>
  );
}

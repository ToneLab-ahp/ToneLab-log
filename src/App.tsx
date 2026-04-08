// src/App.tsx

import { useState } from "react";
import { MenuBar } from "./components/MenuBar";
import { Sidebar } from "./components/Sidebar";
import { SoundResearchTool } from "./components/SoundResearchTool";
import { BottomBar } from "./components/BottomBar";
import { NewStackModal } from "./components/NewStackModal";
import { useApp } from "./context/AppContext";

function AppInner() {
  const [modalSousStackOuverte, setModalSousStackOuverte] = useState(false);
  const [stackIdCible, setStackIdCible] = useState<string | null>(null);
  const { ajouterSousStack, projet, stackSelectionne } = useApp();

  function handleOuvrirModalStack(stackId?: string) {
    // stackId peut venir de la sidebar (clic sur + d'un stack)
    // ou être null (depuis le bouton global)
    const id = stackId ?? stackSelectionne ?? projet?.stacks[0]?.id ?? null;
    setStackIdCible(id);
    setModalSousStackOuverte(true);
  }

  return (
    <div
      className="dark h-screen flex flex-col overflow-hidden"
      style={{ background: "hsl(222, 25%, 8%)" }}
    >
      <MenuBar />

      <div className="flex flex-1 min-h-0">
        <Sidebar onOuvrirModalStack={handleOuvrirModalStack} />

        <main
          className="flex-1 flex min-w-0"
          style={{ background: "hsl(222, 22%, 9%)" }}
        >
          <SoundResearchTool />
        </main>
      </div>

      <BottomBar />

      {modalSousStackOuverte && stackIdCible && (
        <NewStackModal
          stackId={stackIdCible}
          onFermer={() => setModalSousStackOuverte(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppInner />;
}

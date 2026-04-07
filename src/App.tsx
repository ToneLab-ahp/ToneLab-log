// src/App.tsx

import { useState } from "react";
import { MenuBar } from "./components/MenuBar";
import { Sidebar } from "./components/Sidebar";
import { SoundResearchTool } from "./components/SoundResearchTool";
import { BottomBar } from "./components/BottomBar";
import { NewStackModal } from "./components/NewStackModal";
import { useApp } from "./context/AppContext";

function AppInner() {
  const [modalStackOuverte, setModalStackOuverte] = useState(false);

  return (
    <div
      className="dark h-screen flex flex-col overflow-hidden"
      style={{ background: "hsl(222, 25%, 8%)" }}
    >
      <MenuBar />

      <div className="flex flex-1 min-h-0">
        <Sidebar onOuvrirModalStack={() => setModalStackOuverte(true)} />

        <main
          className="flex-1 flex min-w-0"
          style={{ background: "hsl(222, 22%, 9%)" }}
        >
          <SoundResearchTool />
        </main>
      </div>

      <BottomBar />

      {/* Modale nouvelle recherche */}
      {modalStackOuverte && (
        <NewStackModal onFermer={() => setModalStackOuverte(false)} />
      )}
    </div>
  );
}

export default function App() {
  return <AppInner />;
}

// src/components/Sidebar.tsx

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { SoundEntry, ToneLabProject } from "../types";
import ProjetIcon from "../assets/icons/Sidebar/projet.svg?react";
import StackIcon from "../assets/icons/Sidebar/stack.svg?react";
import { HomeButton } from "./HomeButton";

const LARGEUR_MIN = 180;
const LARGEUR_MAX = 480;
const LARGEUR_DEFAUT = 260;

interface EntreeItemProps {
  entry: SoundEntry;
  estSelectionnee: boolean;
  onSelectionner: () => void;
  onSupprimer: () => void;
}

function EntreeItem({
  entry,
  estSelectionnee,
  onSelectionner,
  onSupprimer,
}: EntreeItemProps) {
  const [survol, setSurvol] = useState(false);
  const titre = entry.titre_morceau || "Sans titre";

  return (
    <div
      onClick={onSelectionner}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      className="flex items-center justify-between cursor-pointer rounded-md mx-1 px-2 py-1.5 transition-all"
      style={{
        background: estSelectionnee
          ? "hsl(var(--tl-accent-dim))"
          : survol
            ? "hsl(222, 18%, 18%)"
            : "transparent",
        borderLeft: estSelectionnee
          ? "2px solid hsl(var(--tl-accent-princ))"
          : "2px solid transparent",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <StackIcon
          width="12"
          height="12"
          style={{
            color: estSelectionnee
              ? "hsl(var(--tl-accent-princ))"
              : "hsl(220, 15%, 45%)",
          }}
        />
        <span
          className="text-xs truncate"
          style={{
            color: estSelectionnee
              ? "hsl(210, 30%, 90%)"
              : "hsl(215, 15%, 65%)",
          }}
        >
          {titre}
        </span>
      </div>

      {survol && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Supprimer "${titre}" ?`)) onSupprimer();
          }}
          className="flex-shrink-0 ml-1 transition-colors"
          style={{ color: "hsl(220, 15%, 40%)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "hsl(0, 70%, 60%)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "hsl(220, 15%, 40%)";
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path
              d="M1.5 1.5l7 7M8.5 1.5l-7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

interface ProjetAccordeonProps {
  projet: ToneLabProject;
  onOuvrirModalStack: () => void;
}

function ProjetAccordeon({ projet, onOuvrirModalStack }: ProjetAccordeonProps) {
  const [ouvert, setOuvert] = useState(true);
  const [survol, setSurvol] = useState(false);
  const { entreeSelectionnee, selectionnerEntree, supprimerEntree } = useApp();

  return (
    <div className="mb-1">
      <div
        onClick={() => setOuvert(!ouvert)}
        onMouseEnter={() => setSurvol(true)}
        onMouseLeave={() => setSurvol(false)}
        className="flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded-md cursor-pointer transition-all select-none"
        style={{
          background: survol ? "hsl(222, 18%, 17%)" : "transparent",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className="flex-shrink-0 transition-transform duration-150"
          style={{
            color: "hsl(220, 15%, 45%)",
            transform: ouvert ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          <path d="M3 2l4 3-4 3V2z" />
        </svg>

        <ProjetIcon
          width="13"
          height="13"
          style={{ color: "hsl(var(--tl-accent-princ))" }}
        />

        <span
          className="text-xs font-semibold truncate flex-1"
          style={{ color: "hsl(210, 25%, 80%)" }}
        >
          {projet.nom}
        </span>

        <span
          className="text-[10px] flex-shrink-0"
          style={{ color: "hsl(220, 15%, 40%)" }}
        >
          {projet.entries.length}
        </span>

        {/* Bouton + → ouvre la modale NewStack */}
        {survol && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOuvrirModalStack();
              setOuvert(true);
            }}
            className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all"
            style={{
              background: "hsl(var(--tl-accent-mid))",
              color: "hsl(var(--tl-accent-text))",
            }}
            title="Nouvelle recherche"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="4" y1="1" x2="4" y2="7" />
              <line x1="1" y1="4" x2="7" y2="4" />
            </svg>
          </button>
        )}
      </div>

      {ouvert && (
        <div
          className="mt-0.5"
          style={{
            marginLeft: "22px",
            paddingLeft: "8px",
            borderLeft: "1px solid hsl(220, 15%, 22%)",
          }}
        >
          {projet.entries.length === 0 ? (
            <p
              className="text-[11px] px-2 py-2"
              style={{ color: "hsl(220, 15%, 38%)" }}
            >
              Aucune recherche
            </p>
          ) : (
            projet.entries.map((entry) => (
              <EntreeItem
                key={entry.id}
                entry={entry}
                estSelectionnee={entreeSelectionnee === entry.id}
                onSelectionner={() => selectionnerEntree(entry.id)}
                onSupprimer={() => supprimerEntree(entry.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
interface SidebarProps {
  onOuvrirModalStack: () => void;
}

export function Sidebar({ onOuvrirModalStack }: SidebarProps) {
  const { projet, sidebarOuverte } = useApp();

  const [largeur, setLargeur] = useState(LARGEUR_DEFAUT);
  const enTrainDeRedimensionner = useRef(false);
  const largeurDepart = useRef(0);
  const xDepart = useRef(0);

  const demarrerRedimensionnement = useCallback(
    (e: React.MouseEvent) => {
      enTrainDeRedimensionner.current = true;
      xDepart.current = e.clientX;
      largeurDepart.current = largeur;
      e.preventDefault();
    },
    [largeur],
  );

  useEffect(() => {
    function surMouvement(e: MouseEvent) {
      if (!enTrainDeRedimensionner.current) return;
      const delta = e.clientX - xDepart.current;
      const nouvelleLargeur = Math.min(
        Math.max(largeurDepart.current + delta, LARGEUR_MIN),
        LARGEUR_MAX,
      );
      setLargeur(nouvelleLargeur);
    }
    function surRelachement() {
      enTrainDeRedimensionner.current = false;
    }
    document.addEventListener("mousemove", surMouvement);
    document.addEventListener("mouseup", surRelachement);
    return () => {
      document.removeEventListener("mousemove", surMouvement);
      document.removeEventListener("mouseup", surRelachement);
    };
  }, []);

  if (!sidebarOuverte) return null;

  return (
    <div
      className="flex flex-col h-full flex-shrink-0 relative"
      style={{
        width: `${largeur}px`,
        background: "hsl(222, 20%, 11%)",
        borderRight: "1px solid hsl(220, 15%, 18%)",
      }}
    >
      {/* ── En-tête ── */}
      <div
        className="px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid hsl(220, 15%, 16%)" }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "hsl(220, 15%, 45%)" }}
        >
          Projets
        </span>
      </div>

      {/* ── Bouton Home ── */}
      <div className="px-2 pt-2 pb-1 flex-shrink-0">
        <HomeButton />
      </div>

      {/* ── Séparateur ── */}
      <div
        className="mx-3 flex-shrink-0"
        style={{
          height: "1px",
          background: "hsl(220, 15%, 18%)",
          marginBottom: "6px",
        }}
      />

      {/* ── Liste des projets ── */}
      <div className="flex-1 overflow-y-auto py-1">
        {!projet ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs" style={{ color: "hsl(220, 15%, 35%)" }}>
              Aucun projet ouvert.
              <br />
              Utilisez Fichier → Nouveau projet
            </p>
          </div>
        ) : (
          <ProjetAccordeon
            projet={projet}
            onOuvrirModalStack={onOuvrirModalStack}
          />
        )}
      </div>

      {/* ── Poignée de redimensionnement ── */}
      <div
        onMouseDown={demarrerRedimensionnement}
        className="absolute top-0 right-0 h-full transition-colors"
        style={{
          width: "4px",
          cursor: "col-resize",
          background: "transparent",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "hsl(var(--tl-accent-princ) / 0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      />
    </div>
  );
}

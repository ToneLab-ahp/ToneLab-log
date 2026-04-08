// src/components/Sidebar.tsx

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { Stack, SousStack, ToneLabProject } from "../types";
import ProjetIcon from "../assets/icons/Sidebar/projet.svg?react";
import StackIcon from "../assets/icons/Sidebar/stack.svg?react";
import { HomeButton } from "./HomeButton";

const LARGEUR_MIN = 200;
const LARGEUR_MAX = 520;
const LARGEUR_DEFAUT = 280;

// ── Inline edit ───────────────────────────────────────────────
interface InlineEditProps {
  valeur: string;
  onSauvegarder: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEdit({
  valeur,
  onSauvegarder,
  className,
  style,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(valeur);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function confirmer() {
    const val = draft.trim();
    if (val && val !== valeur) onSauvegarder(val);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={confirmer}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirmer();
          if (e.key === "Escape") {
            setDraft(valeur);
            setEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className={className}
        style={{
          ...style,
          background: "hsl(222, 20%, 20%)",
          border: "1px solid hsl(var(--tl-accent-border))",
          borderRadius: "4px",
          padding: "1px 4px",
          outline: "none",
          width: "100%",
        }}
      />
    );
  }

  return (
    <span className={className} style={style}>
      {valeur}
    </span>
  );
}

// ── Icône crayon ──────────────────────────────────────────────
function CrayonIcon({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 1.5l1.5 1.5L3 8.5 1 9l.5-2L7 1.5z" />
    </svg>
  );
}

// ── Sous-Stack item ───────────────────────────────────────────
interface SousStackItemProps {
  sousStack: SousStack;
  estSelectionne: boolean;
  onSelectionner: () => void;
  onSupprimer: () => void;
  onRenommer: (nom: string) => void;
}

function SousStackItem({
  sousStack,
  estSelectionne,
  onSelectionner,
  onSupprimer,
  onRenommer,
}: SousStackItemProps) {
  const [survol, setSurvol] = useState(false);

  return (
    <div
      onClick={onSelectionner}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 transition-all"
      style={{
        background: estSelectionne
          ? "hsl(var(--tl-accent-dim))"
          : survol
            ? "hsl(222, 18%, 18%)"
            : "transparent",
        borderLeft: estSelectionne
          ? "2px solid hsl(var(--tl-accent-princ))"
          : "2px solid transparent",
      }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <svg
          width="7"
          height="7"
          viewBox="0 0 7 7"
          fill="currentColor"
          style={{
            color: estSelectionne
              ? "hsl(var(--tl-accent-princ))"
              : "hsl(220, 15%, 40%)",
            flexShrink: 0,
          }}
        >
          <circle cx="3.5" cy="3.5" r="2.5" />
        </svg>
        <InlineEdit
          valeur={sousStack.titre}
          onSauvegarder={onRenommer}
          className="text-xs truncate flex-1"
          style={{
            color: estSelectionne ? "hsl(210, 30%, 90%)" : "hsl(215, 15%, 65%)",
            fontFamily: "Geist Variable, sans-serif",
          }}
        />
      </div>
      {survol && (
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Supprimer "${sousStack.titre}" ?`))
                onSupprimer();
            }}
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
            <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
              <path
                d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Stack accordéon ───────────────────────────────────────────
interface StackAccordeonProps {
  stack: Stack;
  onOuvrirModalSousStack: (stackId: string) => void;
}

function StackAccordeon({
  stack,
  onOuvrirModalSousStack,
}: StackAccordeonProps) {
  const [ouvert, setOuvert] = useState(true);
  const [survol, setSurvol] = useState(false);
  const {
    sousStackSelectionne,
    selectionnerSousStack,
    supprimerSousStack,
    renommerStack,
    supprimerStack,
    modifierSousStack,
  } = useApp();

  return (
    <div className="mb-0.5">
      {/* En-tête Stack */}
      <div
        onClick={() => setOuvert(!ouvert)}
        onMouseEnter={() => setSurvol(true)}
        onMouseLeave={() => setSurvol(false)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all select-none"
        style={{ background: survol ? "hsl(222, 18%, 17%)" : "transparent" }}
      >
        <svg
          width="9"
          height="9"
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

        <StackIcon
          width="12"
          height="12"
          style={{ color: "hsl(var(--tl-accent-terc))", flexShrink: 0 }}
        />

        <InlineEdit
          valeur={stack.nom}
          onSauvegarder={(nom) => renommerStack(stack.id, nom)}
          className="text-xs font-semibold truncate flex-1"
          style={{
            color: "hsl(210, 20%, 75%)",
            fontFamily: "Geist Variable, sans-serif",
          }}
        />

        <span
          className="text-[10px] flex-shrink-0"
          style={{ color: "hsl(220, 15%, 40%)" }}
        >
          {stack.sousStacks.length}
        </span>

        {survol && (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onOuvrirModalSousStack(stack.id);
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
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Supprimer le stack "${stack.nom}" et tout son contenu ?`,
                  )
                )
                  supprimerStack(stack.id);
              }}
              className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center"
              style={{ color: "hsl(220, 15%, 40%)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "hsl(0, 70%, 60%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "hsl(220, 15%, 40%)";
              }}
              title="Supprimer le stack"
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Sous-stacks */}
      {ouvert && (
        <div
          style={{
            marginLeft: "20px",
            paddingLeft: "8px",
            borderLeft: "1px solid hsl(220, 15%, 20%)",
          }}
        >
          {stack.sousStacks.length === 0 ? (
            <p
              className="text-[10px] px-2 py-1.5"
              style={{ color: "hsl(220, 15%, 35%)" }}
            >
              Aucune recherche
            </p>
          ) : (
            stack.sousStacks.map((ss) => (
              <SousStackItem
                key={ss.id}
                sousStack={ss}
                estSelectionne={sousStackSelectionne === ss.id}
                onSelectionner={() =>
                  selectionnerSousStack(ss.id, stack.id, ss.entry.id)
                }
                onSupprimer={() => supprimerSousStack(ss.id)}
                onRenommer={(nom) =>
                  modifierSousStack(ss.id, { titre_morceau: nom })
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Projet accordéon ──────────────────────────────────────────
interface ProjetAccordeonProps {
  projet: ToneLabProject;
  onOuvrirModalStack: () => void;
  onOuvrirModalSousStack: (stackId: string) => void;
}

function ProjetAccordeon({
  projet,
  onOuvrirModalStack,
  onOuvrirModalSousStack,
}: ProjetAccordeonProps) {
  const [ouvert, setOuvert] = useState(true);
  const [survol, setSurvol] = useState(false);
  const { renommerProjet } = useApp();
  const totalSousStacks = projet.stacks.reduce(
    (acc, s) => acc + s.sousStacks.length,
    0,
  );

  return (
    <div className="mb-1">
      {/* En-tête Projet */}
      <div
        onClick={() => setOuvert(!ouvert)}
        onMouseEnter={() => setSurvol(true)}
        onMouseLeave={() => setSurvol(false)}
        className="flex items-center gap-1.5 px-2 py-2 mx-1 rounded-md cursor-pointer transition-all select-none"
        style={{ background: survol ? "hsl(222, 18%, 17%)" : "transparent" }}
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
          width="14"
          height="14"
          style={{ color: "hsl(var(--tl-accent-princ))", flexShrink: 0 }}
        />

        <InlineEdit
          valeur={projet.nom}
          onSauvegarder={renommerProjet}
          className="text-sm font-bold truncate flex-1"
          style={{
            color: "hsl(210, 30%, 88%)",
            fontFamily: "Geist Variable, sans-serif",
          }}
        />

        <span
          className="text-[10px] flex-shrink-0"
          style={{ color: "hsl(220, 15%, 40%)" }}
        >
          {totalSousStacks}
        </span>

        {survol && (
          <div
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onOuvrirModalStack}
              className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all"
              style={{
                background: "hsl(var(--tl-accent-mid))",
                color: "hsl(var(--tl-accent-text))",
              }}
              title="Nouveau stack"
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
          </div>
        )}
      </div>

      {/* Stacks */}
      {ouvert && (
        <div
          style={{
            marginLeft: "16px",
            paddingLeft: "8px",
            borderLeft: "1px solid hsl(220, 15%, 18%)",
          }}
        >
          {projet.stacks.length === 0 ? (
            <p
              className="text-[11px] px-2 py-2"
              style={{ color: "hsl(220, 15%, 38%)" }}
            >
              Aucun stack — cliquez sur "+"
            </p>
          ) : (
            projet.stacks.map((stack) => (
              <StackAccordeon
                key={stack.id}
                stack={stack}
                onOuvrirModalSousStack={onOuvrirModalSousStack}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Modal nouveau Stack ───────────────────────────────────────
interface NewStackModalProps {
  onFermer: () => void;
  onCreer: (nom: string) => void;
}

function NouveauStackModal({ onFermer, onCreer }: NewStackModalProps) {
  const [nom, setNom] = useState("");

  function handleOverlay(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onFermer();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(10, 12, 20, 0.82)",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleOverlay}
    >
      <div
        className="flex flex-col rounded-xl shadow-2xl"
        style={{
          width: "360px",
          background: "hsl(222, 22%, 12%)",
          border: "1px solid hsl(220, 15%, 22%)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid hsl(220, 15%, 18%)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "hsl(210, 30%, 90%)" }}
          >
            Nouveau Stack
          </h2>
          <button onClick={onFermer} style={{ color: "hsl(220, 15%, 45%)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">
          <label
            className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: "hsl(var(--tl-accent-text))" }}
          >
            Nom du Stack (ex: album, projet musical…)
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && nom.trim()) {
                onCreer(nom.trim());
                onFermer();
              }
            }}
            placeholder="Ex : Band of Gypsys"
            autoFocus
            className="w-full text-sm px-3 py-2 rounded-md outline-none"
            style={{
              background: "hsl(222, 20%, 16%)",
              border: "1px solid hsl(220, 15%, 24%)",
              color: "hsl(210, 30%, 88%)",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor =
                "hsl(var(--tl-accent-princ))";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor =
                "hsl(220, 15%, 24%)";
            }}
          />
        </div>
        <div
          className="flex justify-end gap-3 px-5 py-4"
          style={{ borderTop: "1px solid hsl(220, 15%, 18%)" }}
        >
          <button
            onClick={onFermer}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "hsl(222, 18%, 18%)",
              color: "hsl(220, 15%, 60%)",
              border: "1px solid hsl(220, 15%, 24%)",
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (nom.trim()) {
                onCreer(nom.trim());
                onFermer();
              }
            }}
            disabled={!nom.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium"
            style={{
              background: nom.trim()
                ? "hsl(var(--tl-accent-button))"
                : "hsl(var(--tl-accent-dim))",
              color: nom.trim()
                ? "hsl(var(--tl-accent-text))"
                : "hsl(220, 15%, 40%)",
              border: "1px solid transparent",
            }}
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar principale ────────────────────────────────────────
interface SidebarProps {
  onOuvrirModalStack: () => void;
}

export function Sidebar({ onOuvrirModalStack }: SidebarProps) {
  const { projet, sidebarOuverte, ajouterStack } = useApp();
  const [modalNouveauStack, setModalNouveauStack] = useState(false);
  const [stackIdPourSousStack, setStackIdPourSousStack] = useState<
    string | null
  >(null);

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
      setLargeur(
        Math.min(
          Math.max(largeurDepart.current + delta, LARGEUR_MIN),
          LARGEUR_MAX,
        ),
      );
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
    <>
      <div
        className="flex flex-col h-full flex-shrink-0 relative"
        style={{
          width: `${largeur}px`,
          background: "hsl(222, 20%, 11%)",
          borderRight: "1px solid hsl(220, 15%, 18%)",
        }}
      >
        {/* En-tête */}
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

        {/* Bouton Home */}
        <div className="px-2 pt-2 pb-1 flex-shrink-0">
          <HomeButton />
        </div>

        {/* Séparateur */}
        <div
          className="mx-3 flex-shrink-0"
          style={{
            height: "1px",
            background: "hsl(220, 15%, 18%)",
            marginBottom: "6px",
          }}
        />

        {/* Liste */}
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
              onOuvrirModalStack={() => setModalNouveauStack(true)}
              onOuvrirModalSousStack={(stackId) => {
                setStackIdPourSousStack(stackId);
                onOuvrirModalStack();
              }}
            />
          )}
        </div>

        {/* Poignée redimensionnement */}
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
            (e.currentTarget as HTMLDivElement).style.background =
              "transparent";
          }}
        />
      </div>

      {/* Modal nouveau Stack */}
      {modalNouveauStack && (
        <NouveauStackModal
          onFermer={() => setModalNouveauStack(false)}
          onCreer={(nom) => ajouterStack(nom)}
        />
      )}
    </>
  );
}

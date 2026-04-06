// src/components/Sidebar.tsx
// La sidebar gauche avec la liste des recherches

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import type { SoundEntry } from "../types";

// ─── Carte d'une entrée dans la sidebar ───────
interface EntreeCardProps {
  entry: SoundEntry;
  estSelectionnee: boolean;
  onSelectionner: () => void;
  onSupprimer: () => void;
}

function EntreeCard({
  entry,
  estSelectionnee,
  onSelectionner,
  onSupprimer,
}: EntreeCardProps) {
  const [survol, setSurvol] = useState(false);

  // Titre affiché : titre du morceau ou "Nouvelle recherche" si vide
  const titre = entry.titre_morceau || "Nouvelle recherche";
  const sousTitre = entry.artiste || entry.instrument || "—";

  return (
    <div
      onClick={onSelectionner}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      className={`relative mx-2 mb-1 p-3 rounded-lg cursor-pointer transition-all ${
        estSelectionnee
          ? "bg-purple-600/20 border border-purple-500/40"
          : survol
            ? "bg-white/5 border border-transparent"
            : "border border-transparent"
      }`}
    >
      {/* Barre colorée à gauche si sélectionné */}
      {estSelectionnee && (
        <div
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: "hsl(262, 80%, 65%)" }}
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* min-w-0 empêche le texte de déborder */}
          <p
            className={`text-sm font-medium truncate ${estSelectionnee ? "text-white" : "text-gray-300"}`}
          >
            {titre}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{sousTitre}</p>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "hsl(262, 40%, 25%)",
                    color: "hsl(262, 80%, 80%)",
                  }}
                >
                  {tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-[10px] text-gray-500">
                  +{entry.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bouton supprimer (visible au survol) */}
        {survol && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Empêche de sélectionner l'entrée en même temps
              if (window.confirm(`Supprimer "${titre}" ?`)) {
                onSupprimer();
              }
            }}
            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
            title="Supprimer"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Composant principal : Sidebar
// ─────────────────────────────────────────────
export function Sidebar() {
  const {
    projet,
    entreeSelectionnee,
    sidebarOuverte,
    ajouterEntree,
    supprimerEntree,
    selectionnerEntree,
  } = useApp();

  const [recherche, setRecherche] = useState("");

  // Filtre les entrées selon la recherche
  const entreesFiltrees =
    projet?.entries.filter((entry) => {
      if (!recherche) return true;
      const terme = recherche.toLowerCase();
      return (
        entry.titre_morceau.toLowerCase().includes(terme) ||
        entry.artiste.toLowerCase().includes(terme) ||
        entry.instrument.toLowerCase().includes(terme) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(terme))
      );
    }) ?? [];

  if (!sidebarOuverte) return null;

  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: "240px",
        background: "hsl(222, 20%, 11%)",
        borderRight: "1px solid hsl(220, 15%, 18%)",
      }}
    >
      {/* ── En-tête de la sidebar ── */}
      <div
        className="px-3 pt-3 pb-2 flex-shrink-0"
        style={{ borderBottom: "1px solid hsl(220, 15%, 16%)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recherches
          </span>
          {projet && (
            <span className="text-xs text-gray-600">
              {projet.entries.length}
            </span>
          )}
        </div>

        {/* Barre de recherche (visible seulement si un projet est ouvert) */}
        {projet && (
          <input
            type="text"
            placeholder="Filtrer…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-md outline-none transition-colors"
            style={{
              background: "hsl(222, 20%, 15%)",
              border: "1px solid hsl(220, 15%, 22%)",
              color: "hsl(210, 30%, 85%)",
            }}
          />
        )}
      </div>

      {/* ── Liste des entrées ── */}
      <div className="flex-1 overflow-y-auto py-2">
        {!projet ? (
          // Pas de projet ouvert
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-gray-600">
              Aucun projet ouvert.
              <br />
              Utilisez Fichier → Nouveau projet
            </p>
          </div>
        ) : entreesFiltrees.length === 0 ? (
          // Projet vide ou pas de résultats de recherche
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-gray-600">
              {recherche
                ? "Aucun résultat."
                : "Aucune recherche.\nCliquez sur + pour commencer."}
            </p>
          </div>
        ) : (
          // Liste des entrées
          entreesFiltrees.map((entry) => (
            <EntreeCard
              key={entry.id}
              entry={entry}
              estSelectionnee={entreeSelectionnee === entry.id}
              onSelectionner={() => selectionnerEntree(entry.id)}
              onSupprimer={() => supprimerEntree(entry.id)}
            />
          ))
        )}
      </div>

      {/* ── Bouton Ajouter ── */}
      {projet && (
        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: "1px solid hsl(220, 15%, 16%)" }}
        >
          <button
            onClick={ajouterEntree}
            className="w-full py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "hsl(262, 60%, 35%)",
              border: "1px solid hsl(262, 60%, 45%)",
              color: "white",
            }}
          >
            + Nouvelle recherche
          </button>
        </div>
      )}
    </div>
  );
}

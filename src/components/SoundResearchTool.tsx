// src/components/SoundResearchTool.tsx
// Le formulaire principal de recherche sonore

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { SoundEntry } from "../types";
import StackIcon from "../assets/icons/Bottombar/stack-tool.svg?react";

// ─── Composant champ de formulaire ────────────
interface ChampProps {
  label: string;
  valeur: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean; // true = zone de texte multiligne
  rows?: number; // Nombre de lignes si multiline
}

function Champ({
  label,
  valeur,
  onChange,
  placeholder,
  multiline,
  rows = 3,
}: ChampProps) {
  const styleCommun = {
    background: "hsl(222, 20%, 13%)",
    border: "1px solid hsl(220, 15%, 22%)",
    color: "hsl(210, 30%, 88%)",
    borderRadius: "0.375rem",
    width: "100%",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s",
    resize: "vertical" as const,
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={styleCommun}
          onFocus={(e) => {
            (e.target as HTMLTextAreaElement).style.borderColor =
              "hsl(262, 80%, 60%)";
          }}
          onBlur={(e) => {
            (e.target as HTMLTextAreaElement).style.borderColor =
              "hsl(220, 15%, 22%)";
          }}
        />
      ) : (
        <input
          type="text"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={styleCommun}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              "hsl(262, 80%, 60%)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              "hsl(220, 15%, 22%)";
          }}
        />
      )}
    </div>
  );
}

// ─── Composant gestion des tags ────────────────
interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagsInput({ tags, onChange }: TagsInputProps) {
  const [saisie, setSaisie] = useState("");

  function ajouterTag() {
    const tag = saisie.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setSaisie("");
  }

  function supprimerTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function gererTouche(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      ajouterTag();
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
        Tags
      </label>

      {/* Liste des tags existants */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{
                background: "hsl(var(--tl-accent-dim))",
                border: "1px solid hsl(var(--tl-accent-border))",
                color: "hsl(var(--tl-accent-text))",
              }}
            >
              {tag}
              <button
                onClick={() => supprimerTag(tag)}
                className="text-purple-400/60 hover:text-red-400 transition-colors ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input pour ajouter un tag */}
      <div className="flex gap-2">
        <input
          type="text"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={gererTouche}
          placeholder="Ajouter un tag (Entrée pour valider)"
          className="flex-1 text-sm px-3 py-2 rounded-md outline-none"
          style={{
            background: "hsl(222, 20%, 13%)",
            border: "1px solid hsl(220, 15%, 22%)",
            color: "hsl(210, 30%, 88%)",
          }}
        />
        <button
          onClick={ajouterTag}
          className="px-3 py-2 rounded-md text-sm transition-colors"
          style={{
            background: "hsl(var(--tl-accent-dim))",
            border: "1px solid hsl(var(--tl-accent-border))",
            color: "hsl(var(--tl-accent-text))",
          }}
        >
          +
        </button>
      </div>
      <p className="text-[11px] text-gray-600 mt-1">
        Appuyez sur Entrée ou , pour ajouter un tag
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Composant principal : SoundResearchTool
// ─────────────────────────────────────────────
export function SoundResearchTool() {
  const { projet, entreeSelectionnee, modifierEntree } = useApp();

  // Trouve l'entrée actuellement sélectionnée
  const entree =
    projet?.entries.find((e) => e.id === entreeSelectionnee) ?? null;

  // État local du formulaire (copie de l'entrée pour l'édition)
  const [form, setForm] = useState<Partial<SoundEntry>>({});

  // Quand l'entrée sélectionnée change, on met à jour le formulaire
  useEffect(() => {
    if (entree) {
      setForm({ ...entree });
    } else {
      setForm({});
    }
  }, [entreeSelectionnee, entree?.id]); // Se déclenche si l'ID change

  // Met à jour un champ du formulaire ET sauvegarde dans le store
  function mettreAJourChamp(
    champ: keyof SoundEntry,
    valeur: string | string[],
  ) {
    if (!entreeSelectionnee) return;
    const modification = { [champ]: valeur };
    setForm((prev) => ({ ...prev, ...modification }));
    modifierEntree(entreeSelectionnee, modification);
  }

  // ─── Écran : pas de projet ──────────────────
  if (!projet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: "hsl(262, 40%, 20%)" }}
          >
            🎵
          </div>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">
            Bienvenue dans ToneLab
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Créez ou ouvrez un projet via le menu{" "}
            <strong className="text-gray-400">Fichier</strong> pour commencer à
            documenter vos recherches sonores.
          </p>
        </div>
      </div>
    );
  }

  // ─── Écran : pas d'entrée sélectionnée ─────
  if (!entree) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">

          <StackIcon
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            width="48"
            height="48"
            style={{
              background: "hsl(222, 20%, 16%)" ,
              color: "hsl(var(--tl-accent-princ))" ,
            }}
          />

          <h2 className="text-base font-medium text-gray-400 mb-2">
            {projet.entries.length === 0
              ? "Aucune recherche pour l'instant"
              : "Sélectionnez une recherche"}
          </h2>
          <p className="text-sm text-gray-600">
            {projet.entries.length === 0
              ? 'Cliquez sur "+ Nouvelle recherche" dans la sidebar pour commencer.'
              : "Choisissez une entrée dans la liste à gauche pour l'éditer."}
          </p>
        </div>
      </div>
    );
  }

  // ─── Formulaire principal ────────────────────
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* ── En-tête du formulaire ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: "hsl(var(--tl-accent-mid))",
                color: "hsl(var(--tl-accent-text))",
              }}
            >
              Sound Research
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">
            {form.titre_morceau || "Nouvelle recherche sonore"}
          </h1>
          {form.artiste && (
            <p className="text-sm text-gray-400 mt-0.5">{form.artiste}</p>
          )}
        </div>

        {/* ── Section : Informations du morceau ── */}
        <section className="mb-6">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3 pb-2"
            style={{
              color: "hsl(var(--tl-accent-text))",
              borderBottom: "1px solid hsl(220, 15%, 18%)",
            }}
          >
            Informations du morceau
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Champ
                label="Titre du morceau"
                valeur={form.titre_morceau ?? ""}
                onChange={(v) => mettreAJourChamp("titre_morceau", v)}
                placeholder="Ex : Superstition"
              />
            </div>
            <Champ
              label="Artiste / Groupe"
              valeur={form.artiste ?? ""}
              onChange={(v) => mettreAJourChamp("artiste", v)}
              placeholder="Ex : Stevie Wonder"
            />
            <Champ
              label="Album"
              valeur={form.album ?? ""}
              onChange={(v) => mettreAJourChamp("album", v)}
              placeholder="Ex : Talking Book"
            />
            <Champ
              label="Année"
              valeur={form.annee ?? ""}
              onChange={(v) => mettreAJourChamp("annee", v)}
              placeholder="Ex : 1972"
            />
          </div>
        </section>

        {/* ── Section : Analyse sonore ── */}
        <section className="mb-6">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3 pb-2"
            style={{
              color: "hsl(var(--tl-accent-terc))",
              borderBottom: "1px solid hsl(220, 15%, 18%)",
            }}
          >
            Analyse sonore
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Champ
              label="Instrument identifié"
              valeur={form.instrument ?? ""}
              onChange={(v) => mettreAJourChamp("instrument", v)}
              placeholder="Ex : Clavinet, Rhodes, Moog…"
            />
            <Champ
              label="Plugin utilisé"
              valeur={form.plugin ?? ""}
              onChange={(v) => mettreAJourChamp("plugin", v)}
              placeholder="Ex : 4Front Rhode x64"
            />
            <div className="col-span-2">
              <Champ
                label="Réglages du plugin"
                valeur={form.reglages_plugin ?? ""}
                onChange={(v) => mettreAJourChamp("reglages_plugin", v)}
                placeholder="Ex : Attack 0ms, Decay 80%, Chorus ON, Drive 40%"
                multiline
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* ── Section : Notes personnelles ── */}
        <section className="mb-6">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3 pb-2"
            style={{
              color: "hsl(150, 60%, 55%)",
              borderBottom: "1px solid hsl(220, 15%, 18%)",
            }}
          >
            Notes personnelles
          </h2>

          <Champ
            label="Notes"
            valeur={form.notes ?? ""}
            onChange={(v) => mettreAJourChamp("notes", v)}
            placeholder="Observations, contexte, idées de reproduction, liens utiles…"
            multiline
            rows={5}
          />
        </section>

        {/* ── Section : Tags ── */}
        <section className="mb-6">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3 pb-2"
            style={{
              color: "hsl(var(--tl-accent-text))",
              borderBottom: "hsl(var(--tl-accent-border))",
            }}
          >
            Organisation
          </h2>

          <TagsInput
            tags={form.tags ?? []}
            onChange={(tags) => mettreAJourChamp("tags", tags)}
          />
        </section>

        {/* ── Métadonnées (en bas, discret) ── */}
        <div
          className="text-[11px] text-gray-600 pt-4"
          style={{ borderTop: "1px solid hsl(220, 15%, 16%)" }}
        >
          <p>
            Créée le{" "}
            {new Date(entree.date_creation).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            Modifiée le{" "}
            {new Date(entree.date_modification).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

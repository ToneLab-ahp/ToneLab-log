// src/store/useAppStore.ts

import { useState, useCallback, useEffect } from "react";
import type {
  AppState,
  ToneLabProject,
  SoundEntry,
  Plugin,
  InstrumentType,
  Stack,
  SousStack,
} from "../types";
import {
  fetchPlugins,
  addPlugin as fbAddPlugin,
  deletePlugin as fbDeletePlugin,
  saveProject,
} from "../services/firebaseService";
import { uploadImageCloudinary } from "../lib/cloudinary";

function genererID(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function maintenant(): string {
  return new Date().toISOString();
}

function creerProjetVide(nom: string): ToneLabProject {
  return {
    version: "1.0.0",
    nom,
    description: "",
    date_creation: maintenant(),
    date_modification: maintenant(),
    stacks: [],
    entries: [],
  };
}

function migrerProjet(projet: ToneLabProject): ToneLabProject {
  // Migration: si le projet a des entries mais pas de stacks, on crée un stack par défaut
  if (
    projet.entries &&
    projet.entries.length > 0 &&
    (!projet.stacks || projet.stacks.length === 0)
  ) {
    const stackDefaut: Stack = {
      id: genererID(),
      nom: "Recherches",
      date_creation: projet.date_creation,
      date_modification: projet.date_modification,
      sousStacks: projet.entries.map((entry) => ({
        id: genererID(),
        titre: entry.titre_morceau || "Sans titre",
        entry,
      })),
    };
    return { ...projet, stacks: [stackDefaut] };
  }
  if (!projet.stacks) return { ...projet, stacks: [] };
  return projet;
}

const CLE_SAUVEGARDE = "tonelab_projet_courant";

function chargerDepuisLocalStorage(): ToneLabProject | null {
  try {
    const donnees = localStorage.getItem(CLE_SAUVEGARDE);
    if (donnees) {
      const projet = JSON.parse(donnees) as ToneLabProject;
      return migrerProjet(projet);
    }
  } catch {
    console.warn("Impossible de charger depuis localStorage");
  }
  return null;
}

function sauvegarderDansLocalStorage(projet: ToneLabProject): void {
  try {
    localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(projet));
  } catch {
    console.warn("Impossible de sauvegarder dans localStorage");
  }
}

// ─────────────────────────────────────────────────────────────────
export function useAppStore() {
  const [state, setState] = useState<AppState>(() => ({
    projet: chargerDepuisLocalStorage(),
    plugins: [],
    pluginsLoading: true,
    entreeSelectionnee: null,
    stackSelectionne: null,
    sousStackSelectionne: null,
    sidebarOuverte: true,
    ongletActif: "stack",
    vueActive: "home",
    modifie: false,
  }));

  useEffect(() => {
    fetchPlugins().then((plugins) => {
      setState((prev) => ({ ...prev, plugins, pluginsLoading: false }));
    });
  }, []);

  const mettreAJourEtat = useCallback((modifications: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...modifications }));
  }, []);

  const setVueActive = useCallback(
    (vue: "home" | "stack") => {
      mettreAJourEtat({ vueActive: vue });
    },
    [mettreAJourEtat],
  );

  // ── Projet ───────────────────────────────────────────────────
  const nouveauProjet = useCallback(
    (nom: string) => {
      const projet = creerProjetVide(nom);
      sauvegarderDansLocalStorage(projet);
      saveProject(projet);
      mettreAJourEtat({
        projet,
        entreeSelectionnee: null,
        stackSelectionne: null,
        sousStackSelectionne: null,
        modifie: false,
        vueActive: "home",
      });
    },
    [mettreAJourEtat],
  );

  const renommerProjet = useCallback(
    (nouveauNom: string) => {
      if (!state.projet) return;
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        nom: nouveauNom,
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({ projet: projetMisAJour, modifie: true });
    },
    [state.projet, mettreAJourEtat],
  );

  const ouvrirProjet = useCallback(
    (contenuJSON: string): boolean => {
      try {
        const projetBrut = JSON.parse(contenuJSON) as ToneLabProject;
        if (!projetBrut.nom || !projetBrut.version)
          throw new Error("Format invalide");
        const projet = migrerProjet(projetBrut);
        sauvegarderDansLocalStorage(projet);
        saveProject(projet);
        mettreAJourEtat({
          projet,
          entreeSelectionnee: null,
          stackSelectionne: null,
          sousStackSelectionne: null,
          modifie: false,
          vueActive: "home",
        });
        return true;
      } catch {
        return false;
      }
    },
    [mettreAJourEtat],
  );

  const sauvegarderProjet = useCallback(() => {
    if (!state.projet) return;
    const projetMisAJour: ToneLabProject = {
      ...state.projet,
      date_modification: maintenant(),
    };
    const contenuJSON = JSON.stringify(projetMisAJour, null, 2);
    const blob = new Blob([contenuJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `${projetMisAJour.nom.replace(/\s+/g, "_")}.tl`;
    lien.click();
    URL.revokeObjectURL(url);
    sauvegarderDansLocalStorage(projetMisAJour);
    saveProject(projetMisAJour);
    mettreAJourEtat({ projet: projetMisAJour, modifie: false });
  }, [state.projet, mettreAJourEtat]);

  const enregistrerProjet = useCallback(() => {
    if (!state.projet) return;
    const projetMisAJour: ToneLabProject = {
      ...state.projet,
      date_modification: maintenant(),
    };
    sauvegarderDansLocalStorage(projetMisAJour);
    saveProject(projetMisAJour);
    mettreAJourEtat({ projet: projetMisAJour, modifie: false });
  }, [state.projet, mettreAJourEtat]);

  // ── Stacks ───────────────────────────────────────────────────
  const ajouterStack = useCallback(
    (nom: string) => {
      if (!state.projet) return;
      const nouveauStack: Stack = {
        id: genererID(),
        nom,
        sousStacks: [],
        date_creation: maintenant(),
        date_modification: maintenant(),
      };
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        stacks: [...state.projet.stacks, nouveauStack],
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({ projet: projetMisAJour, modifie: true });
    },
    [state.projet, mettreAJourEtat],
  );

  const renommerStack = useCallback(
    (stackId: string, nouveauNom: string) => {
      if (!state.projet) return;
      const stacksMisAJour = state.projet.stacks.map((s) =>
        s.id === stackId
          ? { ...s, nom: nouveauNom, date_modification: maintenant() }
          : s,
      );
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        stacks: stacksMisAJour,
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({ projet: projetMisAJour, modifie: true });
    },
    [state.projet, mettreAJourEtat],
  );

  const supprimerStack = useCallback(
    (stackId: string) => {
      if (!state.projet) return;
      const stacksFiltres = state.projet.stacks.filter((s) => s.id !== stackId);
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        stacks: stacksFiltres,
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({
        projet: projetMisAJour,
        stackSelectionne:
          state.stackSelectionne === stackId ? null : state.stackSelectionne,
        sousStackSelectionne: null,
        entreeSelectionnee: null,
        modifie: true,
        vueActive:
          state.stackSelectionne === stackId ? "home" : state.vueActive,
      });
    },
    [state.projet, state.stackSelectionne, state.vueActive, mettreAJourEtat],
  );

  // ── Sous-Stacks ──────────────────────────────────────────────
  const ajouterSousStack = useCallback(
    (
      stackId: string,
      data: {
        titre_morceau: string;
        instrument: InstrumentType | "";
        pluginId: string;
        plugin: string;
        reglages_plugin: string;
        notes: string;
        artiste?: string;
        album?: string;
        annee?: string;
        captureUrl?: string;
      },
    ) => {
      if (!state.projet) return;
      const nouvelleEntry: SoundEntry = {
        id: genererID(),
        titre_morceau: data.titre_morceau,
        artiste: data.artiste ?? "",
        album: data.album ?? "",
        annee: data.annee ?? "",
        instrument: data.instrument,
        pluginId: data.pluginId,
        plugin: data.plugin,
        reglages_plugin: data.reglages_plugin,
        captureUrl: data.captureUrl,
        notes: data.notes,
        tags: [],
        date_creation: maintenant(),
        date_modification: maintenant(),
      };
      const nouveauSousStack: SousStack = {
        id: genererID(),
        titre: data.titre_morceau,
        entry: nouvelleEntry,
      };
      const stacksMisAJour = state.projet.stacks.map((s) =>
        s.id === stackId
          ? {
              ...s,
              sousStacks: [...s.sousStacks, nouveauSousStack],
              date_modification: maintenant(),
            }
          : s,
      );
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        stacks: stacksMisAJour,
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({
        projet: projetMisAJour,
        entreeSelectionnee: nouvelleEntry.id,
        stackSelectionne: stackId,
        sousStackSelectionne: nouveauSousStack.id,
        modifie: true,
        vueActive: "stack",
      });
    },
    [state.projet, mettreAJourEtat],
  );

  const modifierSousStack = useCallback(
    (sousStackId: string, modifications: Partial<SoundEntry>) => {
      if (!state.projet) return;
      const stacksMisAJour = state.projet.stacks.map((s) => ({
        ...s,
        sousStacks: s.sousStacks.map((ss) =>
          ss.id === sousStackId
            ? {
                ...ss,
                titre: modifications.titre_morceau ?? ss.titre,
                entry: {
                  ...ss.entry,
                  ...modifications,
                  date_modification: maintenant(),
                },
              }
            : ss,
        ),
      }));
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        stacks: stacksMisAJour,
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({ projet: projetMisAJour, modifie: true });
    },
    [state.projet, mettreAJourEtat],
  );

  const supprimerSousStack = useCallback(
    (sousStackId: string) => {
      if (!state.projet) return;
      const stacksMisAJour = state.projet.stacks.map((s) => ({
        ...s,
        sousStacks: s.sousStacks.filter((ss) => ss.id !== sousStackId),
      }));
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        stacks: stacksMisAJour,
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({
        projet: projetMisAJour,
        sousStackSelectionne:
          state.sousStackSelectionne === sousStackId
            ? null
            : state.sousStackSelectionne,
        entreeSelectionnee:
          state.sousStackSelectionne === sousStackId
            ? null
            : state.entreeSelectionnee,
        modifie: true,
        vueActive:
          state.sousStackSelectionne === sousStackId ? "home" : state.vueActive,
      });
    },
    [
      state.projet,
      state.sousStackSelectionne,
      state.entreeSelectionnee,
      state.vueActive,
      mettreAJourEtat,
    ],
  );

  const selectionnerSousStack = useCallback(
    (
      sousStackId: string | null,
      stackId: string | null,
      entryId: string | null,
    ) => {
      mettreAJourEtat({
        sousStackSelectionne: sousStackId,
        stackSelectionne: stackId,
        entreeSelectionnee: entryId,
        vueActive: sousStackId ? "stack" : "home",
      });
    },
    [mettreAJourEtat],
  );

  // Gardé pour rétrocompatibilité avec les composants existants
  const selectionnerEntree = useCallback(
    (id: string | null) => {
      mettreAJourEtat({
        entreeSelectionnee: id,
        vueActive: id ? "stack" : "home",
      });
    },
    [mettreAJourEtat],
  );

  const modifierEntree = useCallback(
    (id: string, modifications: Partial<SoundEntry>) => {
      // Cherche dans les sousStacks
      if (!state.projet) return;
      let trouve = false;
      const stacksMisAJour = state.projet.stacks.map((s) => ({
        ...s,
        sousStacks: s.sousStacks.map((ss) => {
          if (ss.entry.id === id) {
            trouve = true;
            return {
              ...ss,
              titre: modifications.titre_morceau ?? ss.titre,
              entry: {
                ...ss.entry,
                ...modifications,
                date_modification: maintenant(),
              },
            };
          }
          return ss;
        }),
      }));
      if (!trouve) return;
      const projetMisAJour: ToneLabProject = {
        ...state.projet,
        stacks: stacksMisAJour,
        date_modification: maintenant(),
      };
      sauvegarderDansLocalStorage(projetMisAJour);
      saveProject(projetMisAJour);
      mettreAJourEtat({ projet: projetMisAJour, modifie: true });
    },
    [state.projet, mettreAJourEtat],
  );

  // Gardé pour rétrocompatibilité
  const ajouterEntree = useCallback(
    (data: {
      titre_morceau: string;
      instrument: InstrumentType | "";
      pluginId: string;
      plugin: string;
      reglages_plugin: string;
      notes: string;
      captureUrl?: string;
    }) => {
      if (!state.projet) return;
      // Cherche le premier stack ou en crée un
      let stackId: string;
      if (state.projet.stacks.length === 0) {
        const nouveauStack: Stack = {
          id: genererID(),
          nom: "Stack 1",
          sousStacks: [],
          date_creation: maintenant(),
          date_modification: maintenant(),
        };
        const projetTemp = {
          ...state.projet,
          stacks: [nouveauStack],
        };
        setState((prev) => ({ ...prev, projet: projetTemp }));
        stackId = nouveauStack.id;
      } else {
        stackId = state.stackSelectionne ?? state.projet.stacks[0].id;
      }
      ajouterSousStack(stackId, data);
    },
    [state.projet, state.stackSelectionne, ajouterSousStack],
  );

  const supprimerEntree = useCallback(
    (id: string) => {
      // Trouve et supprime le sous-stack ayant cette entry.id
      if (!state.projet) return;
      let sousStackId: string | null = null;
      for (const s of state.projet.stacks) {
        const ss = s.sousStacks.find((ss) => ss.entry.id === id);
        if (ss) {
          sousStackId = ss.id;
          break;
        }
      }
      if (sousStackId) supprimerSousStack(sousStackId);
    },
    [state.projet, supprimerSousStack],
  );

  // ── Plugins ──────────────────────────────────────────────────
  const ajouterPlugin = useCallback(
    async (data: {
      nom: string;
      siteUrl: string;
      instrument?: InstrumentType;
      imageFile?: File;
      imageUrl?: string;
    }): Promise<void> => {
      let imageUrl = data.imageUrl ?? "";
      if (data.imageFile) {
        imageUrl = await uploadImageCloudinary(data.imageFile);
      }
      const plugin = await fbAddPlugin({
        nom: data.nom,
        imageUrl,
        siteUrl: data.siteUrl,
        instrument: data.instrument,
        date_ajout: maintenant(),
      });
      setState((prev) => ({
        ...prev,
        plugins: [plugin, ...prev.plugins],
      }));
    },
    [],
  );

  const supprimerPlugin = useCallback(async (id: string): Promise<void> => {
    await fbDeletePlugin(id);
    setState((prev) => ({
      ...prev,
      plugins: prev.plugins.filter((p) => p.id !== id),
    }));
  }, []);

  // ── Sidebar ──────────────────────────────────────────────────
  const toggleSidebar = useCallback(() => {
    mettreAJourEtat({ sidebarOuverte: !state.sidebarOuverte });
  }, [state.sidebarOuverte, mettreAJourEtat]);

  return {
    projet: state.projet,
    plugins: state.plugins,
    pluginsLoading: state.pluginsLoading,
    entreeSelectionnee: state.entreeSelectionnee,
    stackSelectionne: state.stackSelectionne,
    sousStackSelectionne: state.sousStackSelectionne,
    sidebarOuverte: state.sidebarOuverte,
    ongletActif: state.ongletActif,
    vueActive: state.vueActive,
    modifie: state.modifie,
    nouveauProjet,
    renommerProjet,
    ouvrirProjet,
    enregistrerProjet,
    sauvegarderProjet,
    ajouterStack,
    renommerStack,
    supprimerStack,
    ajouterSousStack,
    modifierSousStack,
    supprimerSousStack,
    selectionnerSousStack,
    ajouterEntree,
    modifierEntree,
    supprimerEntree,
    selectionnerEntree,
    toggleSidebar,
    setVueActive,
    ajouterPlugin,
    supprimerPlugin,
  };
}

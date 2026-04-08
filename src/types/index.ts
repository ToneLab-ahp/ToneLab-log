// src/types/index.ts

export type InstrumentType =
  | "piano"
  | "trombone"
  | "trompette"
  | "micro"
  | "rhodes"
  | "synthetiseur"
  | "drum"
  | "cuivres"
  | "cordes"
  | "voix"
  | "autre";

export interface Plugin {
  id: string;
  nom: string;
  imageUrl: string;
  siteUrl: string;
  instrument?: InstrumentType;
  date_ajout: string;
}

export interface SoundEntry {
  id: string;
  titre_morceau: string;
  artiste: string;
  album: string;
  annee: string;
  instrument: InstrumentType | "";
  pluginId: string;
  plugin: string;
  reglages_plugin: string;
  captureUrl?: string;
  notes: string;
  tags: string[];
  date_creation: string;
  date_modification: string;
}

// Sous-stack = une recherche sonore dans un Stack
export interface SousStack {
  id: string;
  titre: string; // nom de la recherche sonore
  entry: SoundEntry;
}

// Stack = un album / groupe de recherches dans un Projet
export interface Stack {
  id: string;
  nom: string; // ex: "Band of Gypsys"
  sousStacks: SousStack[];
  date_creation: string;
  date_modification: string;
}

export interface ToneLabProject {
  version: string;
  nom: string;
  description: string;
  date_creation: string;
  date_modification: string;
  stacks: Stack[];
  entries: SoundEntry[]; // gardé pour rétrocompatibilité
}

export interface AppState {
  projet: ToneLabProject | null;
  plugins: Plugin[];
  pluginsLoading: boolean;
  entreeSelectionnee: string | null; // id de SoundEntry (sousStack.entry.id)
  stackSelectionne: string | null; // id du Stack sélectionné
  sousStackSelectionne: string | null; // id du SousStack sélectionné
  sidebarOuverte: boolean;
  ongletActif: "stack";
  vueActive: "home" | "stack";
  modifie: boolean;
}

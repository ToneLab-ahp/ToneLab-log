// src/types/index.ts
// Ce fichier décrit la structure de toutes les données de l'application

// ─────────────────────────────────────────────
// Une entrée de recherche sonore (Sound Research Entry)
// ─────────────────────────────────────────────
export interface SoundEntry {
    id: string;                    // Identifiant unique généré automatiquement
    titre_morceau: string;         // Ex: "Superstition"
    artiste: string;               // Ex: "Stevie Wonder"
    album: string;                 // Ex: "Talking Book"
    annee: string;                 // Ex: "1972"
    instrument: string;            // Ex: "Clavinet"
    plugin: string;                // Ex: "4Front Rhode x64"
    reglages_plugin: string;       // Ex: "Attack 0, Decay 80, Chorus ON"
    notes: string;                 // Notes libres du musicien
    tags: string[];                // Ex: ["funk", "clavinet", "vintage"]
    date_creation: string;         // Date ISO de création
    date_modification: string;     // Date ISO de dernière modification
}

// ─────────────────────────────────────────────
// Un projet ToneLab (contenu du fichier .tl)
// ─────────────────────────────────────────────
export interface ToneLabProject {
    version: string;               // Version du format (pour évolutions futures)
    nom: string;                   // Ex: "Recherches Jimi Hendrix"
    description: string;           // Description optionnelle
    date_creation: string;         // Date ISO de création du projet
    date_modification: string;     // Date ISO de dernière modification
    entries: SoundEntry[];         // Liste de toutes les recherches
}

// ─────────────────────────────────────────────
// État global de l'application
// ─────────────────────────────────────────────
export interface AppState {
    projet: ToneLabProject | null;         // Le projet actuellement ouvert (null = aucun)
    entreeSelectionnee: string | null;     // ID de l'entrée sélectionnée dans la sidebar
    sidebarOuverte: boolean;               // true = sidebar visible
    ongletActif: 'stack';               // L'outil actif dans la barre du bas
    modifie: boolean;                      // true = des changements non sauvegardés existent
}
// src/store/useAppStore.ts
// Le store central de ToneLab - gère toutes les données et actions

import { useState, useCallback } from 'react';
import type { AppState, ToneLabProject, SoundEntry } from '../types';

// ─── Fonctions utilitaires ───────────────────

// Génère un ID unique pour chaque entrée
function genererID(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Retourne la date/heure actuelle au format ISO
function maintenant(): string {
    return new Date().toISOString();
}

// Crée un projet vide avec les valeurs par défaut
function creerProjetVide(nom: string): ToneLabProject {
    return {
        version: '1.0.0',
        nom,
        description: '',
        date_creation: maintenant(),
        date_modification: maintenant(),
        entries: [],
    };
}

// ─── Clé pour localStorage ───────────────────
const CLE_SAUVEGARDE = 'tonelab_projet_courant';

// ─── Chargement depuis localStorage ──────────
function chargerDepuisLocalStorage(): ToneLabProject | null {
    try {
        const donnees = localStorage.getItem(CLE_SAUVEGARDE);
        if (donnees) {
            return JSON.parse(donnees) as ToneLabProject;
        }
    } catch {
        // Si les données sont corrompues, on ignore
        console.warn('Impossible de charger depuis localStorage');
    }
    return null;
}

// ─── Sauvegarde dans localStorage ────────────
function sauvegarderDansLocalStorage(projet: ToneLabProject): void {
    try {
        localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(projet));
    } catch {
        console.warn('Impossible de sauvegarder dans localStorage');
    }
}

// ─────────────────────────────────────────────
// Hook principal : useAppStore
// Un "hook" React est une fonction qui commence par "use"
// et qui permet à un composant d'accéder à des données partagées
// ─────────────────────────────────────────────
export function useAppStore() {
    // useState : crée une variable d'état + une fonction pour la modifier
    // React re-affiche le composant automatiquement quand l'état change
    const [state, setState] = useState<AppState>(() => ({
        projet: chargerDepuisLocalStorage(), // On charge ce qui était en localStorage
        entreeSelectionnee: null,
        sidebarOuverte: true,
        ongletActif: 'stack',
        modifie: false,
    }));

    // useCallback : mémorise la fonction pour éviter de la recréer à chaque rendu

    // ─── Mettre à jour l'état (interne) ─────────
    const mettreAJourEtat = useCallback((modifications: Partial<AppState>) => {
        setState(prev => ({ ...prev, ...modifications }));
    }, []);

    // ─── Créer un nouveau projet ──────────────
    const nouveauProjet = useCallback((nom: string) => {
        const projet = creerProjetVide(nom);
        sauvegarderDansLocalStorage(projet);
        mettreAJourEtat({
            projet,
            entreeSelectionnee: null,
            modifie: false,
        });
    }, [mettreAJourEtat]);

    // ─── Ouvrir un fichier .tl ────────────────
    // Cette fonction reçoit le contenu JSON du fichier
    const ouvrirProjet = useCallback((contenuJSON: string): boolean => {
        try {
            const projet = JSON.parse(contenuJSON) as ToneLabProject;
            // Vérification minimale : le projet doit avoir un nom et une version
            if (!projet.nom || !projet.version) {
                throw new Error('Format de fichier invalide');
            }
            sauvegarderDansLocalStorage(projet);
            mettreAJourEtat({
                projet,
                entreeSelectionnee: null,
                modifie: false,
            });
            return true;
        } catch {
            return false; // On retourne false pour signaler l'échec à l'interface
        }
    }, [mettreAJourEtat]);

    // ─── Sauvegarder le projet en fichier .tl ─
    const sauvegarderProjet = useCallback(() => {
        if (!state.projet) return;

        const projetMisAJour: ToneLabProject = {
            ...state.projet,
            date_modification: maintenant(),
        };

        // Convertit l'objet JavaScript en texte JSON formaté
        const contenuJSON = JSON.stringify(projetMisAJour, null, 2);

        // Crée un lien de téléchargement virtuel
        const blob = new Blob([contenuJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        // Nom du fichier : nom du projet sans espaces + .tl
        lien.download = `${projetMisAJour.nom.replace(/\s+/g, '_')}.tl`;
        lien.click();
        URL.revokeObjectURL(url); // Libère la mémoire

        sauvegarderDansLocalStorage(projetMisAJour);
        mettreAJourEtat({ projet: projetMisAJour, modifie: false });
    }, [state.projet, mettreAJourEtat]);

    // ─── Enregistrer (mise à jour silencieuse, sans téléchargement) ─
    const enregistrerProjet = useCallback(() => {
        if (!state.projet) return;
        const projetMisAJour: ToneLabProject = {
            ...state.projet,
            date_modification: maintenant(),
        };
        sauvegarderDansLocalStorage(projetMisAJour);
        mettreAJourEtat({ projet: projetMisAJour, modifie: false });
    }, [state.projet, mettreAJourEtat]);

    // ─── Ajouter une nouvelle entrée ──────────
    const ajouterEntree = useCallback(() => {
        if (!state.projet) return;

        const nouvelleEntree: SoundEntry = {
            id: genererID(),
            titre_morceau: '',
            artiste: '',
            album: '',
            annee: '',
            instrument: '',
            plugin: '',
            reglages_plugin: '',
            notes: '',
            tags: [],
            date_creation: maintenant(),
            date_modification: maintenant(),
        };

        const projetMisAJour: ToneLabProject = {
            ...state.projet,
            entries: [...state.projet.entries, nouvelleEntree],
            date_modification: maintenant(),
        };

        sauvegarderDansLocalStorage(projetMisAJour);
        mettreAJourEtat({
            projet: projetMisAJour,
            entreeSelectionnee: nouvelleEntree.id, // Sélectionne automatiquement la nouvelle entrée
            modifie: true,
        });
    }, [state.projet, mettreAJourEtat]);

    // ─── Modifier une entrée existante ────────
    const modifierEntree = useCallback((id: string, modifications: Partial<SoundEntry>) => {
        if (!state.projet) return;

        const entriesMisesAJour = state.projet.entries.map(entry =>
            entry.id === id
                ? { ...entry, ...modifications, date_modification: maintenant() }
                : entry
        );

        const projetMisAJour: ToneLabProject = {
            ...state.projet,
            entries: entriesMisesAJour,
            date_modification: maintenant(),
        };

        sauvegarderDansLocalStorage(projetMisAJour);
        mettreAJourEtat({ projet: projetMisAJour, modifie: true });
    }, [state.projet, mettreAJourEtat]);

    // ─── Supprimer une entrée ─────────────────
    const supprimerEntree = useCallback((id: string) => {
        if (!state.projet) return;

        const entriesFiltrees = state.projet.entries.filter(entry => entry.id !== id);
        const projetMisAJour: ToneLabProject = {
            ...state.projet,
            entries: entriesFiltrees,
            date_modification: maintenant(),
        };

        sauvegarderDansLocalStorage(projetMisAJour);
        mettreAJourEtat({
            projet: projetMisAJour,
            // Si on supprime l'entrée sélectionnée, on déselectionne
            entreeSelectionnee: state.entreeSelectionnee === id ? null : state.entreeSelectionnee,
            modifie: true,
        });
    }, [state.projet, state.entreeSelectionnee, mettreAJourEtat]);

    // ─── Sélectionner une entrée dans la sidebar
    const selectionnerEntree = useCallback((id: string | null) => {
        mettreAJourEtat({ entreeSelectionnee: id });
    }, [mettreAJourEtat]);

    // ─── Ouvrir/fermer la sidebar ─────────────
    const toggleSidebar = useCallback(() => {
        mettreAJourEtat({ sidebarOuverte: !state.sidebarOuverte });
    }, [state.sidebarOuverte, mettreAJourEtat]);

    // ─── Renvoie tout ce dont les composants ont besoin
    return {
        // Données
        projet: state.projet,
        entreeSelectionnee: state.entreeSelectionnee,
        sidebarOuverte: state.sidebarOuverte,
        ongletActif: state.ongletActif,
        modifie: state.modifie,
        // Actions
        nouveauProjet,
        ouvrirProjet,
        enregistrerProjet,
        sauvegarderProjet,
        ajouterEntree,
        modifierEntree,
        supprimerEntree,
        selectionnerEntree,
        toggleSidebar,
    };
}
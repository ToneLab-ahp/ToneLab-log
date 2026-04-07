// src/store/useAppStore.ts

import { useState, useCallback, useEffect } from 'react';
import type { AppState, ToneLabProject, SoundEntry, Plugin, InstrumentType } from '../types';
import {
    fetchPlugins,
    addPlugin as fbAddPlugin,
    deletePlugin as fbDeletePlugin,
    saveProject,
} from '../services/firebaseService';
import { uploadImageCloudinary } from '../lib/cloudinary';

function genererID(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function maintenant(): string {
    return new Date().toISOString();
}

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

const CLE_SAUVEGARDE = 'tonelab_projet_courant';

function chargerDepuisLocalStorage(): ToneLabProject | null {
    try {
        const donnees = localStorage.getItem(CLE_SAUVEGARDE);
        if (donnees) return JSON.parse(donnees) as ToneLabProject;
    } catch {
        console.warn('Impossible de charger depuis localStorage');
    }
    return null;
}

function sauvegarderDansLocalStorage(projet: ToneLabProject): void {
    try {
        localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(projet));
    } catch {
        console.warn('Impossible de sauvegarder dans localStorage');
    }
}

// ─────────────────────────────────────────────────────────────────
export function useAppStore() {
    const [state, setState] = useState<AppState>(() => ({
        projet: chargerDepuisLocalStorage(),
        plugins: [],
        pluginsLoading: true,
        entreeSelectionnee: null,
        sidebarOuverte: true,
        ongletActif: 'stack',
        vueActive: 'home',
        modifie: false,
    }));

    // ── Charge les plugins Firebase au démarrage ─────────────────
    useEffect(() => {
        fetchPlugins().then((plugins) => {
            setState((prev) => ({ ...prev, plugins, pluginsLoading: false }));
        });
    }, []);

    const mettreAJourEtat = useCallback((modifications: Partial<AppState>) => {
        setState((prev) => ({ ...prev, ...modifications }));
    }, []);

    // ── Vue active (home / stack) ────────────────────────────────
    const setVueActive = useCallback(
        (vue: 'home' | 'stack') => {
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
                modifie: false,
                vueActive: 'home',
            });
        },
        [mettreAJourEtat],
    );

    const ouvrirProjet = useCallback(
        (contenuJSON: string): boolean => {
            try {
                const projet = JSON.parse(contenuJSON) as ToneLabProject;
                if (!projet.nom || !projet.version) throw new Error('Format invalide');
                sauvegarderDansLocalStorage(projet);
                saveProject(projet);
                mettreAJourEtat({
                    projet,
                    entreeSelectionnee: null,
                    modifie: false,
                    vueActive: 'home',
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
        const blob = new Blob([contenuJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = `${projetMisAJour.nom.replace(/\s+/g, '_')}.tl`;
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

    // ── Entrées ──────────────────────────────────────────────────
    const ajouterEntree = useCallback(
        (data: {
            titre_morceau: string;
            instrument: InstrumentType | '';
            pluginId: string;
            plugin: string;
            reglages_plugin: string;
            notes: string;
            captureUrl?: string;
        }) => {
            if (!state.projet) return;

            const nouvelleEntree: SoundEntry = {
                id: genererID(),
                titre_morceau: data.titre_morceau,
                artiste: '',
                album: '',
                annee: '',
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

            const projetMisAJour: ToneLabProject = {
                ...state.projet,
                entries: [...state.projet.entries, nouvelleEntree],
                date_modification: maintenant(),
            };

            sauvegarderDansLocalStorage(projetMisAJour);
            saveProject(projetMisAJour);
            mettreAJourEtat({
                projet: projetMisAJour,
                entreeSelectionnee: nouvelleEntree.id,
                modifie: true,
                vueActive: 'stack',
            });
        },
        [state.projet, mettreAJourEtat],
    );

    const modifierEntree = useCallback(
        (id: string, modifications: Partial<SoundEntry>) => {
            if (!state.projet) return;
            const entriesMisesAJour = state.projet.entries.map((entry) =>
                entry.id === id
                    ? { ...entry, ...modifications, date_modification: maintenant() }
                    : entry,
            );
            const projetMisAJour: ToneLabProject = {
                ...state.projet,
                entries: entriesMisesAJour,
                date_modification: maintenant(),
            };
            sauvegarderDansLocalStorage(projetMisAJour);
            saveProject(projetMisAJour);
            mettreAJourEtat({ projet: projetMisAJour, modifie: true });
        },
        [state.projet, mettreAJourEtat],
    );

    const supprimerEntree = useCallback(
        (id: string) => {
            if (!state.projet) return;
            const entriesFiltrees = state.projet.entries.filter((e) => e.id !== id);
            const projetMisAJour: ToneLabProject = {
                ...state.projet,
                entries: entriesFiltrees,
                date_modification: maintenant(),
            };
            sauvegarderDansLocalStorage(projetMisAJour);
            saveProject(projetMisAJour);
            mettreAJourEtat({
                projet: projetMisAJour,
                entreeSelectionnee:
                    state.entreeSelectionnee === id ? null : state.entreeSelectionnee,
                modifie: true,
                vueActive:
                    state.entreeSelectionnee === id ? 'home' : state.vueActive,
            });
        },
        [state.projet, state.entreeSelectionnee, state.vueActive, mettreAJourEtat],
    );

    const selectionnerEntree = useCallback(
        (id: string | null) => {
            mettreAJourEtat({
                entreeSelectionnee: id,
                vueActive: id ? 'stack' : 'home',
            });
        },
        [mettreAJourEtat],
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
            let imageUrl = data.imageUrl ?? '';
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
        sidebarOuverte: state.sidebarOuverte,
        ongletActif: state.ongletActif,
        vueActive: state.vueActive,
        modifie: state.modifie,
        nouveauProjet,
        ouvrirProjet,
        enregistrerProjet,
        sauvegarderProjet,
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
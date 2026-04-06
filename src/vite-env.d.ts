

/// <reference types="vite/client" />

// Déclare à TypeScript que les fichiers .svg importés avec ?react
// sont des composants React valides
declare module '*.svg?react' {
    import React from 'react';
    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, FolderGit2 } from "lucide-react";

export default function App() {
  return (
    <main className="dark min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-5 rounded-2xl bg-primary/10 border border-border shadow-md">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Starter UI React ⚡
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-lg">
          Une base moderne avec Tailwind, shadcn/ui et des icônes Lucide.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {/* Primary - Get Started */}
          <Button
            asChild
            className="flex items-center gap-2 text-base px-6 py-5"
          >
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Sparkles className="w-4 h-4" />
              Get Started
            </a>
          </Button>

          {/* Github */}
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2 text-base px-6 py-5"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FolderGit2 className="w-4 h-4" />
              Github
            </a>
          </Button>

          {/* Learn More */}
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2 text-base px-6 py-5"
          >
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </a>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground pt-6">
          React + Vite + TypeScript + Tailwind + shadcn/ui
        </p>
      </div>
    </main>
  );
}

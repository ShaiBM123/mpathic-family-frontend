import React, { createContext, useEffect, useState } from "react";

interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>
  prompt(): Promise<void>;
}

export const InstallPromptContext = createContext<IBeforeInstallPromptEvent | null>(null);


export const InstallPromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [deferredPrompt, setDeferredPrompt] = useState<IBeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: IBeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
    };
  }, []);

  return (
    <InstallPromptContext.Provider value={deferredPrompt}>
      {children}
    </InstallPromptContext.Provider>
  );
};

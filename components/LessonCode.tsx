"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/* Shares the live editor code between the CodeRunner and the visualizer so that
   editing the numbers in the code updates the chart. The CodeRunner pushes its
   current text via useSetLiveCode() (from its edit handler — never an effect),
   and the visualizer reads it via useLiveCode(). Outside a provider both degrade
   gracefully (undefined / no-op), so CodeRunner stays usable on its own. */

type LiveCode = { code: string; setCode: (code: string) => void };

const LiveCodeContext = createContext<LiveCode | null>(null);

export function LessonCodeProvider({
  initialCode,
  children,
}: {
  initialCode?: string;
  children: ReactNode;
}) {
  const [code, setCode] = useState<string>(initialCode ?? "");
  return (
    <LiveCodeContext.Provider value={{ code, setCode }}>
      {children}
    </LiveCodeContext.Provider>
  );
}

/** The latest editor code, or undefined when there is no provider. */
export function useLiveCode(): string | undefined {
  return useContext(LiveCodeContext)?.code;
}

const NOOP = () => {};

/** Setter to push the latest editor code up; a no-op without a provider. */
export function useSetLiveCode(): (code: string) => void {
  return useContext(LiveCodeContext)?.setCode ?? NOOP;
}

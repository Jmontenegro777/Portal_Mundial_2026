"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type State = { toasts: ToasterToast[] };

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: { type: "ADD" | "DISMISS" | "REMOVE"; toast?: ToasterToast; toastId?: string }) {
  switch (action.type) {
    case "ADD":
      memoryState = { toasts: [action.toast!, ...memoryState.toasts].slice(0, TOAST_LIMIT) };
      break;
    case "DISMISS":
      memoryState = {
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined ? { ...t, open: false } : t
        ),
      };
      break;
    case "REMOVE":
      memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== action.toastId) };
      break;
  }
  listeners.forEach((l) => l(memoryState));
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();
  dispatch({ type: "ADD", toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) { setTimeout(() => dispatch({ type: "REMOVE", toastId: id }), 300); } } } });
  setTimeout(() => dispatch({ type: "DISMISS", toastId: id }), TOAST_REMOVE_DELAY);
  return { id };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);
  return { ...state, toast, dismiss: (id?: string) => dispatch({ type: "DISMISS", toastId: id }) };
}

export { useToast, toast };

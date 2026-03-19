import { useContext } from "react";
import { FournisseurContext } from "../context/FournisseurContext.jsx";
export function useFournisseur() {
  const ctx = useContext(FournisseurContext);
  if (!ctx) throw new Error("useFournisseur must be inside FournisseurProvider");
  return ctx;
}

export const DEFAULT_TEXT = "TEXT";

export function promptForText(initial = ""): string | null {
  const value = window.prompt("Annotation text", initial || DEFAULT_TEXT);
  return value && value.trim() ? value.trim() : null;
}
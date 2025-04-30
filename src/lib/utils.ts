import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Разрешает относительный путь к ресурсу с учетом базового URL приложения
 * Используется, когда приложение размещено в поддиректории
 */
export function resolveAssetPath(relativePath: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${relativePath.startsWith('/') ? relativePath.slice(1) : relativePath}`;
}
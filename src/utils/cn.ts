type ClassValue = string | number | null | undefined | false

/** Joins truthy class name fragments. Deliberately simple - no Tailwind conflict resolution needed at this project's scale. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}

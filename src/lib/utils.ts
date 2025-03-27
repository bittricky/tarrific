type ClassValue =
  | string
  | Record<string, boolean>
  | ClassValue[]
  | undefined
  | null
  | false;

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .filter(Boolean)
    .flatMap((input): string => {
      if (typeof input === "string") return input;
      if (input && typeof input === "object" && !Array.isArray(input)) {
        return Object.entries(input as Record<string, boolean>)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(" ");
      }
      if (Array.isArray(input)) {
        return cn(...input);
      }
      return "";
    })
    .join(" ");
}

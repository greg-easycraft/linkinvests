// Shared utility types and constants

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// Add more shared types here as needed

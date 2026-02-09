import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

type FieldMatcher<T extends FieldValues> = {
  field: keyof T;
  pattern: RegExp;
};

type ServerErrorShape = {
  data?: { error?: string };
  error?: string;
  message?: string;
};

function extractMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const err = error as ServerErrorShape;
    return err.data?.error || err.error || err.message;
  }
  return undefined;
}

export function useServerFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  matchers: Array<FieldMatcher<T>>
) {
  return (error: unknown, fallbackMessage = "Something went wrong") => {
    const message = extractMessage(error) || fallbackMessage;
    const matched = matchers.find((matcher) => matcher.pattern.test(message));

    if (matched) {
      setError(matched.field as FieldPath<T>, { type: "server", message });
      return { handled: true, message };
    }

    return { handled: false, message };
  };
}

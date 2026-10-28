export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-rose-600">{message}</p> : null
}

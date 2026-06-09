import { quotes } from "./defaults";

export function wisdomOfDay() {
  const day = Math.floor(Date.now() / 86400000);
  return quotes[day % quotes.length];
}

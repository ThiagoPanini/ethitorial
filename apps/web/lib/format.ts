// Datas do catálogo são ISO (YYYY-MM-DD) em UTC; formatamos estável em pt-BR.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

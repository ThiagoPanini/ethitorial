// Datas do catálogo são ISO (YYYY-MM-DD) em UTC; formatamos estável em pt-BR.
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = d.getUTCDate(); // no leading zero
  const month = d.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).replace(".", "");
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

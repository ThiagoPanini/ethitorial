import { AppShell } from "@/app/_components/app-shell";
import { WipPage } from "@/app/_components/wip-page";

export const metadata = { title: "Grafo · epistemix" };

export default function GraphPage() {
  return (
    <AppShell>
      <WipPage
        title="Grafo"
        description="Visualização de relações entre tags e artefatos do catálogo."
      />
    </AppShell>
  );
}

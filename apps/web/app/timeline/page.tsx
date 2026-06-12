import { AppShell } from "@/app/_components/app-shell";
import { WipPage } from "@/app/_components/wip-page";

export const metadata = { title: "Cronologia · epistemix" };

export default function TimelinePage() {
  return (
    <AppShell>
      <WipPage
        title="Cronologia"
        description="Feed cronológico de publicações, notas de estudo e conquistas."
      />
    </AppShell>
  );
}

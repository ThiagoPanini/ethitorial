import { AppShell } from "./_components/app-shell";
import { WipPage } from "./_components/wip-page";

export const metadata = { title: "epistemix" };

export default function Home() {
  return (
    <AppShell>
      <WipPage
        title="epistemix"
        description="Hub pessoal de aprendizado — posts, cursos, livros, certificações e palestras."
      />
    </AppShell>
  );
}

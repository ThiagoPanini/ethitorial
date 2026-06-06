import { getSiteModel } from "@/lib/site/model";
import { AppShell } from "./_components/app-shell";
import { NotFoundView } from "./_components/surfaces";

export default function NotFound() {
  const model = getSiteModel();

  return (
    <AppShell
      activeSection={null}
      crumbs={[{ href: "/", label: "epistemix" }, { label: "404" }]}
      model={model}
    >
      <NotFoundView />
    </AppShell>
  );
}

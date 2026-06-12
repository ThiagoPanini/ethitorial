import { AppShell } from "./_components/app-shell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="page wrap">
        <div className="page-head">
          <span className="kicker mono">404</span>
          <h1>Página não encontrada</h1>
          <p className="desc">
            A rota solicitada não existe neste hub. Verifique o endereço ou navegue pelo menu.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

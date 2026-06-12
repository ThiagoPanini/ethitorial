export function WipPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="page wrap">
      <div className="page-head">
        <span className="kicker mono">Em construção</span>
        <h1>{title}</h1>
        {description && <p className="page-head desc">{description}</p>}
      </div>
      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: "13px",
          color: "var(--mut)",
          marginTop: "32px",
          letterSpacing: "0.04em",
        }}
      >
        WIP — esta seção está sendo implementada.
      </p>
    </div>
  );
}

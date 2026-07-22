import Link from "next/link";

type Tab = "perfil" | "carta" | "liga" | "corridas";

function Icon({ name }: { name: Tab }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "perfil") return (<svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>);
  if (name === "carta") return (<svg {...common}><rect x="3" y="6" width="13" height="15" rx="2" /><path d="M8 3h11a2 2 0 0 1 2 2v13" /></svg>);
  if (name === "liga") return (<svg {...common}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" /></svg>);
  return (<svg {...common}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>);
}

const TABS: { id: Tab; label: string; href: string }[] = [
  { id: "perfil", label: "Perfil", href: "/atleta" },
  { id: "carta", label: "Carta", href: "/atleta/carta" },
  { id: "liga", label: "Liga", href: "/atleta/liga" },
  { id: "corridas", label: "Corridas", href: "/atleta/pos-corrida" },
];

export function BottomNav({ active }: { active: Tab }) {
  return (
    <nav className="anav">
      {TABS.map((t) => (
        <Link key={t.id} href={t.href} className={t.id === active ? "on" : ""}>
          <Icon name={t.id} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

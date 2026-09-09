import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-wayfinder", label: "Why" },
  { href: "#faq", label: "Questions" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-display text-sm font-semibold text-espresso-soft transition-colors hover:text-espresso"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Button href="/map" className="px-5 py-2.5 text-sm">
          Open map
        </Button>
      </nav>
    </header>
  );
}

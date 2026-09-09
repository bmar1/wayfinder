import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const PRODUCT = [
  { href: "/map", label: "Open map" },
  { href: "#problem", label: "The problem" },
  { href: "#modernize", label: "The map" },
  { href: "#how-it-works", label: "How it works" },
];

const ABOUT = [
  { href: "#why-wayfinder", label: "Why Wayfinder" },
  { href: "#faq", label: "Questions" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream-deep/80">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20">
        <Logo size="xl" />
        <p className="mt-4 max-w-[42ch] font-serif text-lg leading-relaxed text-espresso-soft">
          Halal-first food near you, starting in Toronto.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-10 sm:max-w-md">
          <div>
            <p className="font-display text-sm font-bold text-espresso">Product</p>
            <ul className="mt-4 flex flex-col gap-3">
              {PRODUCT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-serif text-base text-espresso-soft transition-colors hover:text-harbour"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-espresso">About</p>
            <ul className="mt-4 flex flex-col gap-3">
              {ABOUT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-serif text-base text-espresso-soft transition-colors hover:text-harbour"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Verbatim per Zabihah API terms; exempt from the em-dash-free copy rule. */}
          <p className="font-serif text-xs text-espresso-soft">
            Data © Zabihah — https://www.zabihah.com
          </p>
          <p className="font-serif text-xs text-espresso-soft/70">
            © {new Date().getFullYear()} Wayfinder.
          </p>
        </div>
      </div>
    </footer>
  );
}

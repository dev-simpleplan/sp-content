import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link href="/" className="site-nav__brand">
          sp-website
        </Link>
        <ul className="site-nav__links">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="site-nav__link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

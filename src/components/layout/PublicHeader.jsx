import { Link } from 'react-router-dom';
import { FlaskConical, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-muted-foreground leading-none">IFCE</p>
              <p className="text-sm font-bold text-foreground leading-tight">Vitrine Tecnológica</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/#patentes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Patentes
            </Link>
            <Link to="/#sobre" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/chat">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm">
                Consultar Patentes
              </Button>
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 pb-4 border-t border-border space-y-1">
            <Link to="/" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>Início</Link>
            <Link to="/#patentes" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>Patentes</Link>
            <Link to="/#sobre" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMenuOpen(false)}>Sobre</Link>
            <Link to="/chat" onClick={() => setMenuOpen(false)}>
              <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-semibold">
                Consultar Patentes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
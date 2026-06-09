import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicHeader from '@/components/layout/PublicHeader';
import PatentCard from '@/components/public/PatentCard';
import InterestModal from '@/components/public/InterestModal';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Cpu, Leaf, HeartPulse, Zap, Building2, 
  FlaskConical, Search, Star, ChevronDown, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const areas = [
  { icon: Cpu, label: 'TIC', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Leaf, label: 'Agroindústria', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: HeartPulse, label: 'Saúde', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: Zap, label: 'Energias Renováveis', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { icon: Building2, label: 'Construção Civil', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: FlaskConical, label: 'Biotecnologia', color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function Home() {
  const [featuredPatents, setFeaturedPatents] = useState([]);
  const [allPatents, setAllPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [showInterest, setShowInterest] = useState(false);

  useEffect(() => {
    const load = async () => {
      const patents = await base44.entities.Patent.filter({ is_active: true }, '-created_date', 20);
      setAllPatents(patents);
      setFeaturedPatents(patents.filter(p => p.is_featured).slice(0, 3));
      setLoading(false);
    };
    load();
  }, []);

  const handleInterest = (patent) => {
    setSelectedPatent(patent);
    setShowInterest(true);
  };

  const stats = [
    { label: 'Patentes Cadastradas', value: allPatents.length, icon: FlaskConical },
    { label: 'Áreas Tecnológicas', value: '12+', icon: TrendingUp },
    { label: 'Campi IFCE', value: '30', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Portfólio Tecnológico do IFCE
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-heading">
              Vitrine Tecnológica<br />
              <span className="text-green-300">IFCE</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
              Descubra as inovações e patentes desenvolvidas pelo Instituto Federal do Ceará. 
              Use nossa IA para encontrar a tecnologia certa para o seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/chat">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg gap-2 h-12 px-6">
                  <Search className="w-4 h-4" />
                  Consultar com IA
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#patentes">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-6 gap-2">
                  Ver Patentes
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/15 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-3 gap-6 text-center">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                  <p className="text-xs sm:text-sm text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="py-14 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-foreground mb-1">Áreas Tecnológicas</h2>
            <p className="text-sm text-muted-foreground">Explore nosso portfólio por área de conhecimento</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {areas.map(({ icon: Icon, label, color, bg }) => (
              <Link to={`/chat?area=${encodeURIComponent(label)}`} key={label}>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs font-medium text-center text-foreground/80 leading-tight">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Chat */}
      <section className="py-12 bg-accent/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Não sabe por onde começar?</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nossa IA analisa todas as patentes cadastradas e encontra as que mais se encaixam na sua necessidade. 
              Basta descrever o que você procura em linguagem natural.
            </p>
            <Link to="/chat">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 h-12 px-8">
                <Search className="w-4 h-4" />
                Iniciar Consulta Inteligente
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Patents */}
      {featuredPatents.length > 0 && (
        <section className="py-14" id="patentes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Patentes em Destaque</h2>
                <p className="text-sm text-muted-foreground">Tecnologias selecionadas pela equipe do IFCE</p>
              </div>
              <Link to="/chat" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">Ver todas <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredPatents.map(patent => (
                <PatentCard key={patent.id} patent={patent} onInterest={handleInterest} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All patents */}
      <section className="py-14 bg-muted/30" id="todas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Todas as Patentes</h2>
              <p className="text-sm text-muted-foreground">{allPatents.length} tecnologia(s) disponíveis</p>
            </div>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-border h-64 animate-pulse" />
              ))}
            </div>
          ) : allPatents.length === 0 ? (
            <div className="text-center py-16">
              <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma patente cadastrada ainda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allPatents.map(patent => (
                <PatentCard key={patent.id} patent={patent} onInterest={handleInterest} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="py-14 bg-secondary text-white" id="sobre">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Sobre a Vitrine Tecnológica</h2>
          <p className="text-white/80 leading-relaxed mb-6">
            A Vitrine Tecnológica do IFCE é um portal de inovação que aproxima empresas e empreendedores das 
            pesquisas e desenvolvimentos realizados nos 30 campi do Instituto Federal do Ceará. 
            Utilizamos inteligência artificial para facilitar a descoberta das patentes mais relevantes para cada necessidade.
          </p>
          <p className="text-sm text-white/60">
            Para contato com nossa equipe de transferência de tecnologia: <strong className="text-white">inovacao@ifce.edu.br</strong>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white/60 text-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            <span className="font-semibold text-white/80">Vitrine Tecnológica IFCE</span>
          </div>
          <p>© {new Date().getFullYear()} Instituto Federal do Ceará. Todos os direitos reservados.</p>
          <Link to="/login" className="text-white/40 hover:text-white/70 transition-colors text-xs">
            Acesso Administrativo
          </Link>
        </div>
      </footer>

      <InterestModal patent={selectedPatent} open={showInterest} onClose={() => setShowInterest(false)} />
    </div>
  );
}
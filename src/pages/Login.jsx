import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlaskConical, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await base44.auth.loginViaEmailPassword(email, password);
    window.location.href = '/admin';
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left visual */}
      <div className="hidden lg:flex flex-1 hero-gradient flex-col justify-center items-center text-white p-12">
        <div className="max-w-sm text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-white/30">
            <FlaskConical className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Vitrine Tecnológica</h1>
          <p className="text-lg font-semibold text-green-300 mb-4">IFCE</p>
          <p className="text-white/70 leading-relaxed text-sm">
            Painel administrativo para gestão do portfólio de patentes e tecnologias do Instituto Federal do Ceará.
          </p>
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-xs text-white/50">Acesso restrito a administradores autorizados</p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-6 sm:px-12">
        <div className="max-w-sm w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">IFCE</p>
              <p className="font-bold text-sm">Vitrine Tecnológica</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">Acesso Administrativo</h2>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais para acessar o painel</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> E-mail
              </Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Senha
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold shadow-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← Voltar para a Vitrine Pública
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
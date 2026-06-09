import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [inviting, setInviting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const [u, me] = await Promise.all([
      base44.entities.User.list(),
      base44.auth.me(),
    ]);
    setUsers(u);
    setCurrentUser(me);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole);
    toast({ title: `Convite enviado para ${inviteEmail}!`, description: 'O usuário receberá um e-mail com as instruções de acesso.' });
    setInviteEmail('');
    setShowInvite(false);
    setInviting(false);
    load();
  };

  const adminUsers = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role !== 'admin');

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Administradores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{adminUsers.length} administrador(es) cadastrado(s)</p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="bg-primary hover:bg-primary/90 text-white gap-2 shrink-0">
          <UserPlus className="w-4 h-4" /> Convidar Administrador
        </Button>
      </div>

      {/* Info card */}
      <div className="bg-accent/50 border border-accent rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">Sobre os níveis de acesso</p>
          <p className="text-muted-foreground mt-0.5">
            Administradores têm acesso completo ao painel: podem cadastrar patentes, visualizar leads e relatórios. 
            Para convidar um novo administrador, insira o e-mail e ele receberá as instruções de acesso.
          </p>
        </div>
      </div>

      {/* Admins table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Administradores</h2>
          <Badge variant="secondary" className="ml-auto">{adminUsers.length}</Badge>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : adminUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum administrador cadastrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Nome</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">E-mail</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Desde</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Papel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminUsers.map(user => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.full_name || '(sem nome)'}</p>
                        {currentUser?.id === user.id && (
                          <span className="text-xs text-primary font-medium">Você</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {user.created_date ? format(new Date(user.created_date), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      <Shield className="w-3 h-3 mr-1" /> Admin
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Convidar Administrador
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold mb-1.5">E-mail do novo administrador *</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5">Papel</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              O usuário receberá um e-mail com o link de acesso e instruções para definir sua senha.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={inviting} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold">
                {inviting ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
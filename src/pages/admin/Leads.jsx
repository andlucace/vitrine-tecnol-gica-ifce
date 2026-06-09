import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Users, Building2, Mail, Phone, Hash, Calendar, FlaskConical, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

const STATUS_OPTIONS = ['Novo', 'Em contato', 'Negociando', 'Fechado', 'Descartado'];
const STATUS_COLORS = {
  'Novo': 'bg-primary/10 text-primary border-primary/20',
  'Em contato': 'bg-blue-50 text-blue-700 border-blue-200',
  'Negociando': 'bg-amber-50 text-amber-700 border-amber-200',
  'Fechado': 'bg-green-50 text-green-700 border-green-200',
  'Descartado': 'bg-muted text-muted-foreground border-border',
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [selected, setSelected] = useState(null);
  const { toast } = useToast();

  const TECH_AREAS = ['Agroindústria','TIC','Saúde','Construção Civil','Energias Renováveis','Meio Ambiente','Biotecnologia','Alimentos','Química','Eletroeletrônica','Mecânica','Outras'];

  const load = async () => {
    const data = await base44.entities.Lead.list('-created_date', 200);
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (lead, status) => {
    await base44.entities.Lead.update(lead.id, { status });
    setSelected(prev => prev?.id === lead.id ? { ...prev, status } : prev);
    toast({ title: `Status atualizado para "${status}"` });
    load();
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search || 
      l.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.responsible_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.patent_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchArea = !filterArea || l.tech_area === filterArea;
    return matchSearch && matchStatus && matchArea;
  });

  const statusCount = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Leads / Empresas Interessadas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{leads.length} empresa(s) cadastrada(s)</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === s ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-border hover:border-primary/50'
            }`}
          >
            <p className={`text-2xl font-bold ${filterStatus === s ? 'text-white' : 'text-foreground'}`}>{statusCount[s] || 0}</p>
            <p className={`text-xs mt-0.5 ${filterStatus === s ? 'text-white/80' : 'text-muted-foreground'}`}>{s}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar empresa, responsável, e-mail..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Área tecnológica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todas as áreas</SelectItem>
            {TECH_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || filterStatus || filterArea) && (
          <Button variant="outline" size="icon" onClick={() => { setSearch(''); setFilterStatus(''); setFilterArea(''); }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum lead encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Empresa</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Contato</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Patente de Interesse</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Data</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">{lead.company_name}</p>
                      {lead.cnpj && <p className="text-xs text-muted-foreground font-mono">{lead.cnpj}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm">{lead.responsible_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-foreground line-clamp-1">{lead.patent_title || '—'}</p>
                      {lead.tech_area && <span className="text-xs text-primary">{lead.tech_area}</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-muted-foreground">
                        {lead.created_date ? format(new Date(lead.created_date), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[lead.status] || ''}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(lead)} className="h-8 text-xs gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{selected.company_name}</p>
                    {selected.cnpj && <p className="text-xs text-muted-foreground font-mono">{selected.cnpj}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{selected.responsible_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{selected.phone}</p>
                </div>
              </div>
              
              {selected.patent_title && (
                <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                  <div className="flex items-center gap-2 mb-1">
                    <FlaskConical className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">Patente de interesse</span>
                  </div>
                  <p className="text-sm font-medium">{selected.patent_title}</p>
                  {selected.tech_area && <p className="text-xs text-muted-foreground mt-0.5">{selected.tech_area}</p>}
                </div>
              )}

              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Mensagem</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selected.message}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Atualizar status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        selected.status === s 
                          ? 'bg-primary text-white border-primary'
                          : 'border-border hover:border-primary text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
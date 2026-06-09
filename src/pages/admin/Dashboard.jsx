import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { 
  FileText, Users, Search, TrendingUp, 
  ArrowUpRight, BarChart2, Clock, FlaskConical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#00813A', '#003366', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'];

export default function Dashboard() {
  const [patents, setPatents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [searchLogs, setSearchLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, l, s] = await Promise.all([
        base44.entities.Patent.list('-created_date', 100),
        base44.entities.Lead.list('-created_date', 100),
        base44.entities.SearchLog.list('-created_date', 200),
      ]);
      setPatents(p);
      setLeads(l);
      setSearchLogs(s);
      setLoading(false);
    };
    load();
  }, []);

  // Stats
  const activePatents = patents.filter(p => p.is_active).length;
  const newLeads = leads.filter(l => l.status === 'Novo').length;
  const totalSearches = searchLogs.length;
  const searchesWithResults = searchLogs.filter(s => s.result_count > 0).length;

  // Area distribution
  const areaData = Object.entries(
    searchLogs.reduce((acc, log) => {
      const area = log.classified_area || 'Não classificado';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Searches per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStr = format(d, 'dd/MM');
    const count = searchLogs.filter(s => {
      const logDate = new Date(s.created_date);
      return format(logDate, 'dd/MM/yyyy') === format(d, 'dd/MM/yyyy');
    }).length;
    return { day: dayStr, consultas: count };
  });

  // Top patents by views
  const topPatents = [...patents].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);

  const stats = [
    { label: 'Patentes Ativas', value: activePatents, icon: FlaskConical, color: 'text-primary', bg: 'bg-primary/10', link: '/admin/patents' },
    { label: 'Leads / Empresas', value: leads.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/leads' },
    { label: 'Total de Consultas', value: totalSearches, icon: Search, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/reports' },
    { label: 'Novos Leads', value: newLeads, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', link: '/admin/leads' },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-border animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Visão geral da Vitrine Tecnológica IFCE</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} to={link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Searches per day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Consultas nos últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="consultas" fill="#00813A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Areas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Áreas mais pesquisadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={areaData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name">
                    {areaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhuma consulta registrada ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent leads */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Leads recentes
            </CardTitle>
            <Link to="/admin/leads" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lead.company_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.patent_title || 'Interesse geral'}</p>
                  </div>
                  <span className={`ml-2 shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    lead.status === 'Novo' ? 'bg-primary/10 text-primary' :
                    lead.status === 'Em contato' ? 'bg-blue-50 text-blue-700' :
                    'bg-muted text-muted-foreground'
                  }`}>{lead.status}</span>
                </div>
              ))}
              {leads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum lead ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent searches */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Consultas recentes
            </CardTitle>
            <Link to="/admin/reports" className="text-xs text-primary hover:underline flex items-center gap-1">
              Relatórios <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Search className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{log.query_text}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {log.classified_area && (
                        <span className="text-xs text-primary">{log.classified_area}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{log.result_count} resultado(s)</span>
                    </div>
                  </div>
                </div>
              ))}
              {searchLogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma consulta ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
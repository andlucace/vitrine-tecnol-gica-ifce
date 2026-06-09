import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { Download, TrendingUp, Search, Users, BarChart2, FileText } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#00813A', '#003366', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981', '#f97316'];

export default function Reports() {
  const [searchLogs, setSearchLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const load = async () => {
      const [s, l, p] = await Promise.all([
        base44.entities.SearchLog.list('-created_date', 500),
        base44.entities.Lead.list('-created_date', 500),
        base44.entities.Patent.list('-created_date', 100),
      ]);
      setSearchLogs(s);
      setLeads(l);
      setPatents(p);
      setLoading(false);
    };
    load();
  }, []);

  const periodDays = parseInt(period);
  const cutoff = subDays(new Date(), periodDays);

  const filteredLogs = searchLogs.filter(l => new Date(l.created_date) >= cutoff);
  const filteredLeads = leads.filter(l => new Date(l.created_date) >= cutoff);

  // Searches per day
  const daysArr = Array.from({ length: Math.min(periodDays, 30) }, (_, i) => {
    const d = subDays(new Date(), Math.min(periodDays, 30) - 1 - i);
    const dayStr = format(d, 'dd/MM');
    const count = filteredLogs.filter(s => format(new Date(s.created_date), 'dd/MM/yyyy') === format(d, 'dd/MM/yyyy')).length;
    return { day: dayStr, consultas: count };
  });

  // Area distribution
  const areaData = Object.entries(
    filteredLogs.reduce((acc, log) => {
      const area = log.classified_area || 'Não classificado';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  // Top searches
  const topSearches = Object.entries(
    filteredLogs.reduce((acc, log) => {
      acc[log.query_text] = (acc[log.query_text] || 0) + 1;
      return acc;
    }, {})
  ).map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count).slice(0, 10);

  // Funnel
  const funnel = [
    { name: 'Consultas', value: filteredLogs.length },
    { name: 'Com resultados', value: filteredLogs.filter(l => l.result_count > 0).length },
    { name: 'Cadastros', value: filteredLeads.length },
  ];

  // Lead areas
  const leadAreaData = Object.entries(
    filteredLeads.reduce((acc, lead) => {
      const area = lead.tech_area || 'Não identificado';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando relatórios...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios & Indicadores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Análise das consultas e engajamento</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportCSV(searchLogs, 'consultas.csv')} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Consultas no período', value: filteredLogs.length, icon: Search, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Com resultados', value: filteredLogs.filter(l => l.result_count > 0).length, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Leads captados', value: filteredLeads.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Taxa de conversão', value: filteredLogs.length > 0 ? `${((filteredLeads.length / filteredLogs.length) * 100).toFixed(1)}%` : '0%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
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
        ))}
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Funil de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={funnel} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#00813A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Searches over time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Consultas por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={daysArr}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="consultas" stroke="#00813A" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Area pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Distribuição por área tecnológica</CardTitle>
          </CardHeader>
          <CardContent>
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={areaData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name">
                    {areaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={v => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Sem dados para este período</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top searches & Lead areas */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top queries */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Consultas mais frequentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => exportCSV(topSearches, 'top_consultas.csv')} className="h-7 gap-1 text-xs">
              <Download className="w-3 h-3" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma consulta no período</p>
              ) : topSearches.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{item.query}</p>
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div className="bg-primary h-1 rounded-full" style={{ width: `${(item.count / topSearches[0].count) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{item.count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leads by area */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Leads por área de interesse</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => exportCSV(leads, 'leads_completo.csv')} className="h-7 gap-1 text-xs">
              <Download className="w-3 h-3" /> Exportar leads
            </Button>
          </CardHeader>
          <CardContent>
            {leadAreaData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum lead no período</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadAreaData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#003366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
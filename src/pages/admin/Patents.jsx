import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Search, Edit2, Trash2, Upload, FileText, 
  Eye, EyeOff, Star, StarOff, Filter, X, Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TECH_AREAS = ['Agroindústria','TIC','Saúde','Construção Civil','Energias Renováveis','Meio Ambiente','Biotecnologia','Alimentos','Química','Eletroeletrônica','Mecânica','Outras'];
const STATUS_OPTIONS = ['Depositada','Em análise','Concedida','Licenciada','Disponível para licenciamento'];

const EMPTY_FORM = { title: '', patent_number: '', tech_area: '', description: '', inventors: '', campus: '', status: 'Disponível para licenciamento', filing_date: '', keywords: '', is_featured: false, is_active: true };

export default function Patents() {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatent, setEditingPatent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showInpiModal, setShowInpiModal] = useState(false);
  const [inpiForm, setInpiForm] = useState({ cnpj: '', cpf: '' });
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const data = await base44.entities.Patent.list('-created_date', 100);
    setPatents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInpiImport = async (e) => {
    e.preventDefault();
    if (!inpiForm.cnpj && !inpiForm.cpf) {
      const err = { error: true, message: 'Informe um CNPJ ou CPF para consulta' };
      setImportResult(err);
      setTimeout(() => setImportResult(null), 3000);
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const response = await base44.functions.invoke('importInpiPatents', {
        cnpj: inpiForm.cnpj || undefined,
        cpf: inpiForm.cpf || undefined,
      });
      setImportResult(response.data);
      if (response.data.imported > 0) {
        toast({ title: `${response.data.imported} patente(s) importada(s) com sucesso!` });
        load();
      }
    } catch (err) {
      const errorData = { error: true, message: err.response?.data?.error || 'Erro ao importar patentes' };
      setImportResult(errorData);
      setTimeout(() => setImportResult(null), 3000);
    }
    setImporting(false);
  };

  const openCreate = () => { setEditingPatent(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => { setEditingPatent(p); setForm({ ...EMPTY_FORM, ...p }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingPatent) {
      await base44.entities.Patent.update(editingPatent.id, form);
      toast({ title: 'Patente atualizada com sucesso!' });
    } else {
      await base44.entities.Patent.create(form);
      toast({ title: 'Patente cadastrada com sucesso!' });
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Patent.delete(id);
    setDeleteConfirm(null);
    toast({ title: 'Patente removida.' });
    load();
  };

  const toggleActive = async (p) => {
    await base44.entities.Patent.update(p.id, { is_active: !p.is_active });
    load();
  };

  const toggleFeatured = async (p) => {
    await base44.entities.Patent.update(p.id, { is_featured: !p.is_featured });
    load();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, file_url, file_name: file.name }));
    setUploading(false);
    toast({ title: 'Arquivo enviado com sucesso!' });
  };

  const filtered = patents.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()) || p.patent_number?.toLowerCase().includes(search.toLowerCase());
    const matchArea = !filterArea || p.tech_area === filterArea;
    return matchSearch && matchArea;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Patentes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{patents.length} patente(s) cadastrada(s)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setShowInpiModal(true); setImportResult(null); setInpiForm({ cnpj: '', cpf: '' }); }} variant="outline" className="gap-2 shrink-0">
            <Download className="w-4 h-4" /> Importar do INPI
          </Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Nova Patente
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descrição ou número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="Todas as áreas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todas as áreas</SelectItem>
            {TECH_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || filterArea) && (
          <Button variant="outline" size="icon" onClick={() => { setSearch(''); setFilterArea(''); }}>
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
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma patente encontrada</p>
            <Button onClick={openCreate} variant="outline" size="sm" className="mt-3 gap-2">
              <Plus className="w-4 h-4" /> Cadastrar primeira patente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Patente</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Área</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Status</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Destaque</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Ativo</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{p.title}</p>
                      {p.patent_number && <p className="text-xs text-muted-foreground font-mono">{p.patent_number}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">{p.tech_area}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFeatured(p)} className="text-muted-foreground hover:text-amber-500 transition-colors">
                        {p.is_featured ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <StarOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(p)}>
                        {p.is_active ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 w-8 p-0">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(p)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPatent ? 'Editar Patente' : 'Nova Patente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Título *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Título da patente" required className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Número da Patente</Label>
                <Input value={form.patent_number} onChange={e => setForm(p => ({ ...p, patent_number: e.target.value }))} placeholder="BR1020230000001" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Área Tecnológica *</Label>
                <Select value={form.tech_area} onValueChange={v => setForm(p => ({ ...p, tech_area: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{TECH_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Descrição *</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição detalhada da patente e suas aplicações..." required className="mt-1.5 resize-none" rows={4} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Inventores</Label>
                <Input value={form.inventors} onChange={e => setForm(p => ({ ...p, inventors: e.target.value }))} placeholder="Nome 1, Nome 2..." className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Campus</Label>
                <Input value={form.campus} onChange={e => setForm(p => ({ ...p, campus: e.target.value }))} placeholder="Campus IFCE" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Data de Depósito</Label>
                <Input type="date" value={form.filing_date} onChange={e => setForm(p => ({ ...p, filing_date: e.target.value }))} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Palavras-chave (separadas por vírgula)</Label>
                <Input value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} placeholder="iot, sensor, monitoramento, irrigação..." className="mt-1.5" />
              </div>

              {/* File Upload */}
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Arquivo (PDF ou Word)</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-all text-sm text-muted-foreground">
                    <Upload className="w-4 h-4 shrink-0" />
                    {uploading ? 'Enviando...' : form.file_name || 'Clique para selecionar arquivo'}
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  {form.file_url && <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Ver arquivo</a>}
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} id="featured" />
                  <Label htmlFor="featured" className="text-sm cursor-pointer">Destacar na página inicial</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} id="active" />
                  <Label htmlFor="active" className="text-sm cursor-pointer">Patente ativa</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold">
                {saving ? 'Salvando...' : (editingPatent ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* INPI Import Modal */}
      <Dialog open={showInpiModal} onOpenChange={setShowInpiModal}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Patentes do INPI</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Consulte patentes registradas no INPI por CNPJ ou CPF do titular. As patentes encontradas serão importadas para a base do sistema.
          </p>
          <form onSubmit={handleInpiImport} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">CNPJ do titular</Label>
                <Input
                  value={inpiForm.cnpj}
                  onChange={e => setInpiForm(p => ({ ...p, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                  className="mt-1.5"
                  disabled={importing}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">CPF do titular</Label>
                <Input
                  value={inpiForm.cpf}
                  onChange={e => setInpiForm(p => ({ ...p, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="mt-1.5"
                  disabled={importing}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Preencha ao menos um dos campos acima.</p>

            {importing && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                Consultando API do INPI e importando patentes...
              </div>
            )}

            {/* Error message — auto-dismisses after 3s */}
            {importResult?.error && (
              <div className="rounded-lg p-3 bg-red-50 text-red-700 border border-red-200 text-sm">
                {importResult.error === true ? importResult.message : importResult.error}
              </div>
            )}

            {/* Success with found patents table */}
            {importResult && !importResult.error && importResult.found_patents?.length > 0 && (
              <div className="space-y-3">
                <div className="rounded-lg p-3 bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
                  {importResult.message}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    {importResult.total_found} patente(s) encontrada(s)
                  </p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Pedido</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Título</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden sm:table-cell">IPC</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground hidden md:table-cell">Depósito</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {importResult.found_patents.map((p, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-mono text-muted-foreground">{p.pedido || '-'}</td>
                            <td className="px-3 py-2 line-clamp-2">{p.titulo}</td>
                            <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{p.ipc || '-'}</td>
                            <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{p.deposito || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {importResult && !importResult.error && (!importResult.found_patents || importResult.found_patents.length === 0) && (
              <div className="rounded-lg p-3 bg-amber-50 text-amber-700 border border-amber-200 text-sm">
                {importResult.message || 'Nenhuma patente encontrada.'}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowInpiModal(false)} className="flex-1" disabled={importing}>
                Fechar
              </Button>
              <Button type="submit" disabled={importing} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold">
                {importing ? 'Consultando...' : 'Consultar e Importar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Deseja remover a patente <strong>"{deleteConfirm?.title}"</strong>? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm.id)} className="flex-1">Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
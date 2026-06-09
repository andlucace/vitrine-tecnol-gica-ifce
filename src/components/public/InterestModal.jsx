import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Building2, User, Mail, Phone, Hash } from 'lucide-react';

export default function InterestModal({ patent, open, onClose }) {
  const [form, setForm] = useState({ cnpj: '', company_name: '', responsible_name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.company_name.trim()) e.company_name = 'Informe a razão social';
    if (!form.responsible_name.trim()) e.responsible_name = 'Informe o responsável';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.phone.trim()) e.phone = 'Informe o telefone';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await base44.entities.Lead.create({
      ...form,
      patent_id: patent?.id,
      patent_title: patent?.title,
      tech_area: patent?.tech_area,
      status: 'Novo',
    });
    setLoading(false);
    setSuccess(true);
  };

  const handleClose = () => {
    setForm({ cnpj: '', company_name: '', responsible_name: '', email: '', phone: '', message: '' });
    setErrors({});
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {success ? (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Interesse registrado!</h3>
              <p className="text-sm text-muted-foreground">
                Recebemos seu contato sobre a patente <strong>"{patent?.title}"</strong>.<br />
                Nossa equipe retornará em breve.
              </p>
            </div>
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90 text-white mt-2">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Demonstrar Interesse</DialogTitle>
              <DialogDescription className="text-sm">
                Preencha seus dados para recebermos seu contato sobre:<br />
                <strong className="text-foreground">{patent?.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> CNPJ (opcional)
                  </Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> Razão Social *
                  </Label>
                  <Input
                    placeholder="Nome da empresa"
                    value={form.company_name}
                    onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                    className={`h-9 text-sm ${errors.company_name ? 'border-destructive' : ''}`}
                  />
                  {errors.company_name && <p className="text-xs text-destructive mt-1">{errors.company_name}</p>}
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Responsável *
                  </Label>
                  <Input
                    placeholder="Nome completo"
                    value={form.responsible_name}
                    onChange={e => setForm(p => ({ ...p, responsible_name: e.target.value }))}
                    className={`h-9 text-sm ${errors.responsible_name ? 'border-destructive' : ''}`}
                  />
                  {errors.responsible_name && <p className="text-xs text-destructive mt-1">{errors.responsible_name}</p>}
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Telefone *
                  </Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className={`h-9 text-sm ${errors.phone ? 'border-destructive' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> E-mail *
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@empresa.com.br"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className={`h-9 text-sm ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold mb-1.5">Mensagem (opcional)</Label>
                  <Textarea
                    placeholder="Descreva seu interesse ou aplicação pretendida..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-10">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-semibold">
                  {loading ? 'Enviando...' : 'Enviar Interesse'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
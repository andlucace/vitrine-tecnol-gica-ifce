import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Hash, Star, ExternalLink } from 'lucide-react';

const areaColors = {
  'Agroindústria': 'bg-amber-50 text-amber-700 border-amber-200',
  'TIC': 'bg-blue-50 text-blue-700 border-blue-200',
  'Saúde': 'bg-red-50 text-red-700 border-red-200',
  'Construção Civil': 'bg-orange-50 text-orange-700 border-orange-200',
  'Energias Renováveis': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Meio Ambiente': 'bg-green-50 text-green-700 border-green-200',
  'Biotecnologia': 'bg-purple-50 text-purple-700 border-purple-200',
  'Alimentos': 'bg-lime-50 text-lime-700 border-lime-200',
  'Química': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Eletroeletrônica': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Mecânica': 'bg-slate-50 text-slate-700 border-slate-200',
  'Outras': 'bg-gray-50 text-gray-700 border-gray-200',
};

const statusColors = {
  'Disponível para licenciamento': 'bg-primary/10 text-primary border-primary/20',
  'Concedida': 'bg-green-50 text-green-700 border-green-200',
  'Licenciada': 'bg-blue-50 text-blue-700 border-blue-200',
  'Depositada': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Em análise': 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function PatentCard({ patent, onInterest, relevanceScore }) {
  const areaClass = areaColors[patent.tech_area] || areaColors['Outras'];
  const statusClass = statusColors[patent.status] || statusColors['Outras'];

  return (
    <div className="patent-card bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${areaClass}`}>
            {patent.tech_area}
          </span>
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${statusClass}`}>
            {patent.status}
          </span>
          {relevanceScore && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {Math.round(relevanceScore * 100)}% aderente
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-foreground mb-2 leading-snug line-clamp-2">
          {patent.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
          {patent.description}
        </p>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          {patent.patent_number && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono">{patent.patent_number}</span>
            </div>
          )}
          {patent.campus && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>{patent.campus}</span>
            </div>
          )}
          {patent.filing_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{new Date(patent.filing_date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            onClick={() => onInterest && onInterest(patent)}
            className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm font-semibold h-9"
          >
            Tenho Interesse
          </Button>
          {patent.file_url && (
            <a href={patent.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-9 px-3">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
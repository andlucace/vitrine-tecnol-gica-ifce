import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const IPC_AREA_MAP = {
  'A01': 'Agroindústria',
  'A21': 'Alimentos',
  'A22': 'Alimentos',
  'A23': 'Alimentos',
  'A61': 'Saúde',
  'C02': 'Meio Ambiente',
  'C04': 'Construção Civil',
  'C08': 'Química',
  'C09': 'Química',
  'C12': 'Biotecnologia',
  'E02': 'Construção Civil',
  'E03': 'Construção Civil',
  'E04': 'Construção Civil',
  'E21': 'Energias Renováveis',
  'F03': 'Energias Renováveis',
  'F24': 'Energias Renováveis',
  'G01': 'Eletroeletrônica',
  'G06': 'TIC',
  'G08': 'Eletroeletrônica',
  'H01': 'Eletroeletrônica',
  'H02': 'Eletroeletrônica',
  'H04': 'TIC',
  'H05': 'Eletroeletrônica',
  'B01': 'Química',
  'B09': 'Meio Ambiente',
  'B65': 'Mecânica',
  'F16': 'Mecânica',
};

function mapIpcToTechArea(ipc) {
  if (!ipc) return 'Outras';
  const prefix = ipc.substring(0, 3);
  return IPC_AREA_MAP[prefix] || 'Outras';
}

function parseBrazilianDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Apenas administradores podem importar patentes' }, { status: 403 });

    const body = await req.json();
    const { cnpj, cpf } = body;
    if (!cnpj && !cpf) {
      return Response.json({ error: 'Informe um CNPJ ou CPF para consulta' }, { status: 400 });
    }

    const token = Deno.env.get('INPI_API_TOKEN');
    if (!token) {
      return Response.json({ error: 'Token da API INPI não configurado' }, { status: 500 });
    }

    const apiArgs = { token, timeout: '300' };
    if (cnpj) apiArgs.cnpj = cnpj.replace(/\D/g, '');
    if (cpf) apiArgs.cpf = cpf.replace(/\D/g, '');

    const formBody = new URLSearchParams(apiArgs).toString();

    const response = await fetch('https://api.infosimples.com/api/v2/consultas/inpi/patentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });

    const result = await response.json();

    if (result.code !== 200) {
      const errorMsg = result.errors?.join('; ') || result.code_message || 'Erro desconhecido na API';
      return Response.json({ error: `Erro na consulta INPI (código ${result.code}): ${errorMsg}` }, { status: 502 });
    }

    // Extract all patent processes from all data items
    const allProcessos = [];
    for (const dataItem of result.data || []) {
      for (const processo of dataItem.processos || []) {
        allProcessos.push(processo);
      }
    }

    // Build preview list for frontend display
    const foundPatents = allProcessos.map(proc => ({
      titulo: proc.titulo || 'Sem título',
      pedido: proc.pedido || '',
      ipc: proc.ipc || '',
      deposito: proc.deposito || '',
      status_inpi: proc.status || '',
    }));

    if (allProcessos.length === 0) {
      return Response.json({ imported: 0, skipped: 0, total_found: 0, found_patents: [], message: 'Nenhuma patente encontrada para esta consulta.' });
    }

    // Check existing patent numbers to avoid duplicates
    const existingPatents = await base44.asServiceRole.entities.Patent.filter({});
    const existingNumbers = new Set(existingPatents.map(p => p.patent_number).filter(Boolean));

    let imported = 0;
    let skipped = 0;

    for (const proc of allProcessos) {
      const patentNumber = proc.pedido || '';
      if (patentNumber && existingNumbers.has(patentNumber)) {
        skipped++;
        continue;
      }

      const patentData = {
        title: proc.titulo || 'Sem título',
        patent_number: patentNumber,
        tech_area: mapIpcToTechArea(proc.ipc),
        description: `Patente registrada no INPI. Classificação IPC: ${proc.ipc || 'N/A'}. Data de depósito: ${proc.deposito || 'N/A'}.`,
        inventors: '',
        campus: 'IFCE',
        status: 'Disponível para licenciamento',
        filing_date: parseBrazilianDate(proc.deposito),
        keywords: proc.ipc || '',
        is_active: true,
        is_featured: false,
        view_count: 0,
      };

      await base44.asServiceRole.entities.Patent.create(patentData);
      if (patentNumber) existingNumbers.add(patentNumber);
      imported++;
    }

    return Response.json({
      imported,
      skipped,
      total_found: allProcessos.length,
      found_patents: foundPatents,
      message: `${imported} patentes importadas, ${skipped} já existentes (de ${allProcessos.length} encontradas).`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
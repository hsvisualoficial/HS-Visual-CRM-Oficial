import { supabase } from '../lib/supabase';

export interface InstallmentParams {
  clienteId: string;
  razaoSocial: string;
  valor: string | number;
  vencimento: string | number;
  duracao: string | number;
  dataInicio: string;
}

export const generateInstallments = async ({
  clienteId,
  razaoSocial,
  valor,
  vencimento,
  duracao,
  dataInicio
}: InstallmentParams) => {
  const duracaoTotal = typeof duracao === 'string' ? parseInt(duracao) || 1 : duracao;
  const valorNumerico = typeof valor === 'string' 
    ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0 
    : valor;
  
  // Helper v45: Parsing seguro (Data Local sem shift UTC)
  const parseSafeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day || 1);
  };

  const startDate = parseSafeDate(dataInicio);
  const diaBase = typeof vencimento === 'string' ? parseInt(vencimento) || startDate.getDate() : vencimento;
  const now = new Date();
  // Zerar horas para comparação justa de "Passado"
  now.setHours(0, 0, 0, 0);

  const parcelas = [];
  for (let i = 0; i < duracaoTotal; i++) {
    const dataVenc = new Date(startDate);
    dataVenc.setMonth(dataVenc.getMonth() + i);
    dataVenc.setDate(diaBase);
    
    // Ajuste fino para não pular mês caso o dia seja 31 e o mês seguinte tenha 30
    if (dataVenc.getDate() !== diaBase) {
      dataVenc.setDate(0); 
    }

    // Lógica Retroativa: Se a data de vencimento for no passado (ou hoje), marcar como Pago
    const isPast = dataVenc < now;

    parcelas.push({
      cliente_id: clienteId,
      descricao: `Mensalidade ${i + 1}/${duracaoTotal} - ${razaoSocial}`,
      valor: valorNumerico,
      data_vencimento: dataVenc.toISOString().split('T')[0],
      status: isPast ? 'Pago' : 'Pendente',
      tipo: 'Entrada',
      categoria: 'Contrato'
    });
  }

  // Limpar parcelas PENDENTES existentes para evitar duplicidade em caso de edição
  await supabase
    .from('financeiro')
    .delete()
    .eq('cliente_id', clienteId)
    .eq('status', 'Pendente');
  
  const { error } = await supabase.from('financeiro').insert(parcelas);
  if (error) throw error;
  
  return parcelas;
};

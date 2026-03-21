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
  
  // Usar data de início ou data atual como fallback
  const startDate = dataInicio ? new Date(dataInicio) : new Date();
  const diaBase = typeof vencimento === 'string' ? parseInt(vencimento) || startDate.getDate() : vencimento;
  const now = new Date();

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

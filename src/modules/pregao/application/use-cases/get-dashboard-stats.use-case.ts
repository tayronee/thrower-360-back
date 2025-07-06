import { Injectable, Inject } from '@nestjs/common';
import { IPregaoDetalheRepository } from '../../domain/repositories/pregao-detalhe.repository.interface';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';
import { DashboardStatsDto, ResumoFinanceiroDto } from '../../interfaces/dtos/dashboard-stats.dto';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @Inject('IPregaoDetalheRepository')
    private readonly pregaoDetalheRepository: IPregaoDetalheRepository,
    @Inject('IPregaoRepository')
    private readonly pregaoRepository: IPregaoRepository,
  ) {}

  async execute(dataInicial?: Date, dataFinal?: Date): Promise<DashboardStatsDto> {
    // Se não foram informadas datas, usar o dia de hoje
    const hoje = new Date();
    const inicioHoje = new Date(hoje);
    inicioHoje.setHours(0, 0, 0, 0);
    
    const fimHoje = new Date(hoje);
    fimHoje.setHours(23, 59, 59, 999);

    const dataIni = dataInicial || inicioHoje;
    const dataFim = dataFinal || fimHoje;

    // 1. Primeiro busca a quantidade de pregões
    const quantidadePregoes = await this.pregaoDetalheRepository.countByDateRange(dataIni, dataFim);

    // 2. Depois busca a quantidade de itens
    const quantidadeItens = await this.pregaoRepository.countByDateRange(dataIni, dataFim);

    // 3. Por último busca o resumo financeiro
    const resumoFinanceiro = await this.pregaoRepository.getFinancialSummaryByDateRange(dataIni, dataFim);

    // 4. Junta tudo em um objeto final
    return {
      quantidadePregoes,
      quantidadeItens,
      resumoFinanceiro: {
        investimentoTotal: Number(resumoFinanceiro.investimentoTotal.toFixed(2)),
        lucroBrutoTotal: Number(resumoFinanceiro.lucroBrutoTotal.toFixed(2)),
        lucroLiquidoTotal: Number(resumoFinanceiro.lucroLiquidoTotal.toFixed(2)),
        roiMedio: Number(resumoFinanceiro.roiMedio.toFixed(2)),
      },
      dataInicial: dataIni,
      dataFinal: dataFim,
    };
  }
}

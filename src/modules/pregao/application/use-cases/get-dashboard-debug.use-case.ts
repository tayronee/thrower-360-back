import { Injectable, Inject } from '@nestjs/common';
import { IPregaoDetalheRepository } from '../../domain/repositories/pregao-detalhe.repository.interface';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';

@Injectable()
export class GetDashboardDebugUseCase {
  constructor(
    @Inject('IPregaoDetalheRepository')
    private readonly pregaoDetalheRepository: IPregaoDetalheRepository,
    @Inject('IPregaoRepository')
    private readonly pregaoRepository: IPregaoRepository,
  ) {}

  async execute(): Promise<any> {
    try {
      // Busca todos os dados sem filtro de data
      const [pregoes, itens] = await Promise.all([
        this.pregaoDetalheRepository.findAll(),
        this.pregaoRepository.findAll(),
      ]);

      // Calcula resumo financeiro manualmente para debug
      let investimentoTotal = 0;
      let lucroBrutoTotal = 0;
      let lucroLiquidoTotal = 0;
      let roiTotal = 0;

      for (const item of itens) {
        if (item.resultado) {
          investimentoTotal += item.resultado.investimento || 0;
          lucroBrutoTotal += item.resultado.valorBruto || 0;
          lucroLiquidoTotal += item.resultado.valorLiquido || 0;
          roiTotal += item.resultado.roi || 0;
        }
      }

      const roiMedio = itens.length > 0 ? roiTotal / itens.length : 0;

      return {
        quantidadePregoes: pregoes.length,
        quantidadeItens: itens.length,
        resumoFinanceiro: {
          investimentoTotal: Number(investimentoTotal.toFixed(2)),
          lucroBrutoTotal: Number(lucroBrutoTotal.toFixed(2)),
          lucroLiquidoTotal: Number(lucroLiquidoTotal.toFixed(2)),
          roiMedio: Number(roiMedio.toFixed(2)),
        },
        debug: {
          amostraPregao: pregoes[0] || null,
          amostraItem: itens[0] || null,
          temDados: pregoes.length > 0 || itens.length > 0,
        }
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        debug: 'Erro ao executar consulta debug'
      };
    }
  }
}

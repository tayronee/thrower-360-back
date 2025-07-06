import { Pregao } from '../entities/pregao.entity';

export interface IPregaoRepository {
  create(pregao: Pregao): Promise<Pregao>;
  findAll(): Promise<Pregao[]>;
  findByNumeroPregao(numeroPregao: string): Promise<Pregao[]>;
  countByDateRange(dataInicial: Date, dataFinal: Date): Promise<number>;
  getFinancialSummaryByDateRange(dataInicial: Date, dataFinal: Date): Promise<{
    investimentoTotal: number;
    lucroBrutoTotal: number;
    lucroLiquidoTotal: number;
    roiMedio: number;
  }>;
  updateByIdReferencia(idReferencia: string, data: Partial<Pregao>): Promise<Pregao | null>;
}

export class DashboardStatsDto {
  quantidadePregoes!: number;
  quantidadeItens!: number;
  resumoFinanceiro!: ResumoFinanceiroDto;
  dataInicial!: Date;
  dataFinal!: Date;
}

export class ResumoFinanceiroDto {
  investimentoTotal!: number;
  lucroBrutoTotal!: number;
  lucroLiquidoTotal!: number;
  roiMedio!: number;
}

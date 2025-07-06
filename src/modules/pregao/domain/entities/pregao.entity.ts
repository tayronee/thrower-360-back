export class PregaoResultado {
  investimento!: number;
  valorBruto!: number;
  valorMinimoTotal!: number;
  descontos!: number;
  valorLiquido!: number;
  lucro!: number;
  roi!: number;
  lucroMinimo!: number;
  valorLiquidoMinimo!: number;
  roiMinimo!: number;
}

export class Pregao {
  id?: string;
  idPregao!: string;
  idReferencia!: string;
  statusPregao?: string;
  numeroPregao!: string;
  nomeProduto!: string;
  quantidade!: number;
  valorUnitarioCompra!: number;
  valorUnitarioVenda!: number;
  percentualAlvo!: number;
  valorMinimo!: number;
  percentualMinimo!: number;
  icms!: number;
  fcp!: number;
  logistica!: number;
  resultado!: PregaoResultado;
  dataHora!: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

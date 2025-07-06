import { IsNotEmpty, IsNumber, IsString, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class PregaoResultadoDto {
  @IsNumber() investimento!: number;
  @IsNumber() valorBruto!: number;
  @IsNumber() valorMinimoTotal!: number;
  @IsNumber() descontos!: number;
  @IsNumber() valorLiquido!: number;
  @IsNumber() lucro!: number;
  @IsNumber() roi!: number;
  @IsNumber() lucroMinimo!: number;
  @IsNumber() valorLiquidoMinimo!: number;
  @IsNumber() roiMinimo!: number;
}

export class CreatePregaoDto {
  @IsString() @IsNotEmpty() numeroPregao!: string;
  @IsString() @IsNotEmpty() nomeProduto!: string;
  @IsNumber() quantidade!: number;
  @IsNumber() valorUnitarioCompra!: number;
  @IsNumber() valorUnitarioVenda!: number;
  @IsNumber() percentualAlvo!: number;
  @IsNumber() valorMinimo!: number;
  @IsNumber() percentualMinimo!: number;
  @IsNumber() icms!: number;
  @IsNumber() fcp!: number;
  @IsNumber() logistica!: number;
  @ValidateNested() @Type(() => PregaoResultadoDto) resultado!: PregaoResultadoDto;
  @IsDateString() dataHora!: string;
  idReferencia?: string;
  statusPregao?: string;
  idPregao!: string;
}

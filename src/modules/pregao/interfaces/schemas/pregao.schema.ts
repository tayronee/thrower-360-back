import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const PregaoModelName = 'Pregao';

@Schema({ _id: true, timestamps: false })
export class PregaoResultadoSchema {
  @Prop() investimento!: number;
  @Prop() valorBruto!: number;
  @Prop() valorMinimoTotal!: number;
  @Prop() descontos!: number;
  @Prop() valorLiquido!: number;
  @Prop() lucro!: number;
  @Prop() roi!: number;
  @Prop() lucroMinimo!: number;
  @Prop() valorLiquidoMinimo!: number;
  @Prop() roiMinimo!: number;
}

@Schema({ timestamps: true })
export class PregaoSchemaClass {
  @Prop({ unique: true, required: true })
  idReferencia!: string;
  @Prop({ required: true }) numeroPregao!: string;
  @Prop({ required: true }) nomeProduto!: string;
  @Prop({ required: true }) quantidade!: number;
  @Prop({ required: true }) valorUnitarioCompra!: number;
  @Prop({ required: true }) valorUnitarioVenda!: number;
  @Prop({ required: true }) percentualAlvo!: number;
  @Prop({ required: true }) valorMinimo!: number;
  @Prop({ required: true }) percentualMinimo!: number;
  @Prop({ required: true }) icms!: number;
  @Prop({ required: true }) fcp!: number;
  @Prop({ required: true }) logistica!: number;
  @Prop({ type: PregaoResultadoSchema, required: true }) resultado!: PregaoResultadoSchema;
  @Prop({ required: true }) dataHora!: Date;
  @Prop()
  statusPregao?: string;
  @Prop({ required: true })
  idPregao!: string;
  
  // Campos de timestamp adicionados automaticamente pelo Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export type PregaoDocument = PregaoSchemaClass & Document;
export const PregaoSchema = SchemaFactory.createForClass(PregaoSchemaClass);

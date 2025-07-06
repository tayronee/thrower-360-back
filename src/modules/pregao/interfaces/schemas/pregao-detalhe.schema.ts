import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PregaoDetalheSchemaClass {
  @Prop({ required: true })
  numeroPregao!: string;

  @Prop({ required: true })
  estado!: string;

  @Prop({ required: true })
  cidade!: string;

  @Prop({ required: true })
  detalhes!: string;
}

export type PregaoDetalheDocument = PregaoDetalheSchemaClass & Document & {
  createdAt: Date;
  updatedAt: Date;
};
export const PregaoDetalheSchema = SchemaFactory.createForClass(PregaoDetalheSchemaClass);
export const PregaoDetalheModelName = 'PregaoDetalhe';

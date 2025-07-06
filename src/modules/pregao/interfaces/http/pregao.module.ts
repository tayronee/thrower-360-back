import { Module } from '@nestjs/common';
import { PregaoController } from './pregao.controller';
import { CreatePregaoUseCase } from '../../application/use-cases/create-pregao.use-case';
import { FindAllPregoesUseCase } from '../../application/use-cases/find-all-pregoes.usecase';
import { UpdatePregaoUseCase } from '../../application/use-cases/update-pregao.use-case';
import { PregaoRepository } from '../../infrastructure/repositories/pregao.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PregaoSchema } from '../../interfaces/schemas/pregao.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Pregao', schema: PregaoSchema }]),
  ],
  controllers: [PregaoController],
  providers: [
    CreatePregaoUseCase,
    FindAllPregoesUseCase,
    UpdatePregaoUseCase,
    {
      provide: 'IPregaoRepository',
      useClass: PregaoRepository,
    },
  ],
})
export class PregaoModule {}

import { Module } from '@nestjs/common';
import { PregaoDetalheController } from './pregao-detalhe.controller';
import { CreatePregaoDetalheUseCase } from '../../application/use-cases/create-pregao-detalhe.use-case';
import { FindAllPregaoDetalheUseCase } from '../../application/use-cases/find-all-pregao-detalhe.use-case';
import { FindPregaoDetalheByIdUseCase } from '../../application/use-cases/find-pregao-detalhe-by-id.use-case';
import { FindAllPregoesWithItensUseCase } from '../../application/use-cases/find-all-pregoes-with-itens.use-case';
import { FindPregaoWithItensByIdUseCase } from '../../application/use-cases/find-pregao-with-itens-by-id.use-case';
import { UpdatePregaoDetalheUseCase } from '../../application/use-cases/update-pregao-detalhe.use-case';
import { PregaoDetalheRepository } from '../../infrastructure/repositories/pregao-detalhe.repository';
import { PregaoRepositoryMongo } from '../../infrastructure/repositories/pregao.repository.mongo';
import { MongooseModule } from '@nestjs/mongoose';
import { PregaoDetalheSchema, PregaoDetalheModelName } from '../schemas/pregao-detalhe.schema';
import { PregaoSchema, PregaoModelName } from '../schemas/pregao.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PregaoDetalheModelName, schema: PregaoDetalheSchema },
      { name: PregaoModelName, schema: PregaoSchema },
    ]),
  ],
  controllers: [PregaoDetalheController],
  providers: [
    CreatePregaoDetalheUseCase,
    FindAllPregaoDetalheUseCase,
    FindPregaoDetalheByIdUseCase,
    FindAllPregoesWithItensUseCase,
    FindPregaoWithItensByIdUseCase,
    UpdatePregaoDetalheUseCase,
    {
      provide: 'IPregaoDetalheRepository',
      useClass: PregaoDetalheRepository,
    },
    {
      provide: 'IPregaoRepository',
      useClass: PregaoRepositoryMongo,
    },
  ],
})
export class PregaoDetalheModule {}

import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';
import { GetDashboardDebugUseCase } from '../../application/use-cases/get-dashboard-debug.use-case';
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
  controllers: [DashboardController],
  providers: [
    GetDashboardStatsUseCase,
    GetDashboardDebugUseCase,
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
export class DashboardModule {}

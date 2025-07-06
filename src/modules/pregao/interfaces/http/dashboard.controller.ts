import { Controller, Get, Query } from '@nestjs/common';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';
import { GetDashboardDebugUseCase } from '../../application/use-cases/get-dashboard-debug.use-case';
import { DashboardStatsDto } from '../dtos/dashboard-stats.dto';
import { DashboardQueryDto } from '../dtos/dashboard-query.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PregaoDocument, PregaoModelName } from '../schemas/pregao.schema';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getDashboardDebugUseCase: GetDashboardDebugUseCase,
    @InjectModel(PregaoModelName) private readonly pregaoModel: Model<PregaoDocument>,
  ) {}

  @Get('stats')
  async getStats(@Query() query: DashboardQueryDto): Promise<DashboardStatsDto> {
    const dataInicial = query.dataInicial ? new Date(query.dataInicial) : undefined;
    const dataFinal = query.dataFinal ? new Date(query.dataFinal) : undefined;

    return this.getDashboardStatsUseCase.execute(dataInicial, dataFinal);
  }

  @Get('debug')
  async getDebugInfo(): Promise<any> {
    // Endpoint para debug - busca todos os dados sem filtro
    return this.getDashboardDebugUseCase.execute();
  }

  @Get('debug/all')
  async getAllCounts(): Promise<any> {
    // Conta todos os registros sem filtro de data para debug
    try {
      // Acessa os repositórios através do use case
      const pregaoDetalheRepo = this.getDashboardStatsUseCase['pregaoDetalheRepository'];
      const pregaoRepo = this.getDashboardStatsUseCase['pregaoRepository'];
      
      const [totalPregoes, totalItens] = await Promise.all([
        pregaoDetalheRepo.findAll(),
        pregaoRepo.findAll(),
      ]);
      
      return {
        totalPregoesNoBanco: totalPregoes.length,
        totalItensNoBanco: totalItens.length,
        amostraPregao: totalPregoes[0] || null,
        amostraItem: totalItens[0] || null,
        message: 'Debug: Total de registros no banco sem filtro de data'
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro ao acessar dados para debug'
      };
    }
  }

  @Get('test-timestamps')
  async testTimestamps(): Promise<any> {
    try {
      // Busca os últimos 5 registros e verifica os campos de data
      const registros = await this.pregaoModel
        .find({})
        .sort({ _id: -1 })
        .limit(5)
        .lean()
        .exec();

      const analise = registros.map((registro: any) => ({
        id: registro._id,
        numeroPregao: registro.numeroPregao,
        temCreatedAt: !!registro.createdAt,
        temUpdatedAt: !!registro.updatedAt,
        temDataHora: !!registro.dataHora,
        createdAt: registro.createdAt,
        updatedAt: registro.updatedAt,
        dataHora: registro.dataHora,
      }));

      return {
        totalRegistros: registros.length,
        analise,
        resumo: {
          registrosComCreatedAt: analise.filter(r => r.temCreatedAt).length,
          registrosComUpdatedAt: analise.filter(r => r.temUpdatedAt).length,
          registrosComDataHora: analise.filter(r => r.temDataHora).length,
        },
        message: 'Análise dos campos de data nos últimos 5 registros'
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro ao verificar timestamps'
      };
    }
  }
}

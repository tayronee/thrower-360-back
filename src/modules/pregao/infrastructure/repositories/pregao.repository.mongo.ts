import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';
import { Pregao } from '../../domain/entities/pregao.entity';
import { PregaoDocument, PregaoModelName } from '../../interfaces/schemas/pregao.schema';

@Injectable()
export class PregaoRepositoryMongo implements IPregaoRepository {
  constructor(
    @InjectModel(PregaoModelName) private readonly pregaoModel: Model<PregaoDocument>,
  ) {}

  async create(pregao: Pregao): Promise<Pregao> {
    const created = await this.pregaoModel.create({ ...pregao });
    return {
      id: created.id,
      idPregao: created.idPregao,
      idReferencia: created.idReferencia,
      statusPregao: created.statusPregao,
      numeroPregao: created.numeroPregao,
      nomeProduto: created.nomeProduto,
      quantidade: created.quantidade,
      valorUnitarioCompra: created.valorUnitarioCompra,
      valorUnitarioVenda: created.valorUnitarioVenda,
      percentualAlvo: created.percentualAlvo,
      valorMinimo: created.valorMinimo,
      percentualMinimo: created.percentualMinimo,
      icms: created.icms,
      fcp: created.fcp,
      logistica: created.logistica,
      resultado: created.resultado,
      dataHora: created.dataHora,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async findAll(): Promise<Pregao[]> {
    const docs = await this.pregaoModel.find().lean().exec();
    return docs.map((doc: any) => ({
      id: doc._id?.toString(),
      idPregao: doc.idPregao,
      idReferencia: doc.idReferencia,
      statusPregao: doc.statusPregao,
      numeroPregao: doc.numeroPregao,
      nomeProduto: doc.nomeProduto,
      quantidade: doc.quantidade,
      valorUnitarioCompra: doc.valorUnitarioCompra,
      valorUnitarioVenda: doc.valorUnitarioVenda,
      percentualAlvo: doc.percentualAlvo,
      valorMinimo: doc.valorMinimo,
      percentualMinimo: doc.percentualMinimo,
      icms: doc.icms,
      fcp: doc.fcp,
      logistica: doc.logistica,
      resultado: doc.resultado,
      dataHora: doc.dataHora,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findByNumeroPregao(numeroPregao: string): Promise<Pregao[]> {
    const docs = await this.pregaoModel.find({ numeroPregao }).lean().exec();
    return docs.map((doc: any) => ({
      id: doc._id?.toString(),
      idPregao: doc.idPregao,
      idReferencia: doc.idReferencia,
      statusPregao: doc.statusPregao,
      numeroPregao: doc.numeroPregao,
      nomeProduto: doc.nomeProduto,
      quantidade: doc.quantidade,
      valorUnitarioCompra: doc.valorUnitarioCompra,
      valorUnitarioVenda: doc.valorUnitarioVenda,
      percentualAlvo: doc.percentualAlvo,
      valorMinimo: doc.valorMinimo,
      percentualMinimo: doc.percentualMinimo,
      icms: doc.icms,
      fcp: doc.fcp,
      logistica: doc.logistica,
      resultado: doc.resultado,
      dataHora: doc.dataHora,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async updateByIdReferencia(idReferencia: string, data: Partial<Pregao>): Promise<Pregao | null> {
    const updated = await this.pregaoModel.findOneAndUpdate(
      { idReferencia },
      data,
      { new: true }
    ).lean();
    
    if (!updated) return null;
    
    return {
      id: updated.id,
      idPregao: updated.idPregao,
      idReferencia: updated.idReferencia,
      statusPregao: updated.statusPregao,
      numeroPregao: updated.numeroPregao,
      nomeProduto: updated.nomeProduto,
      quantidade: updated.quantidade,
      valorUnitarioCompra: updated.valorUnitarioCompra,
      valorUnitarioVenda: updated.valorUnitarioVenda,
      percentualAlvo: updated.percentualAlvo,
      valorMinimo: updated.valorMinimo,
      percentualMinimo: updated.percentualMinimo,
      icms: updated.icms,
      fcp: updated.fcp,
      logistica: updated.logistica,
      resultado: updated.resultado,
      dataHora: updated.dataHora,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async countByDateRange(dataInicial: Date, dataFinal: Date): Promise<number> {
    // Configurar apenas ano, mês e dia (ignorando horas)
    const startDate = new Date(dataInicial);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(dataFinal);
    endDate.setUTCHours(23, 59, 59, 999);

    // Primeiro tenta por createdAt, comparando apenas a data (sem horas)
    const countByCreatedAt = await this.pregaoModel.countDocuments({
      $expr: {
        $and: [
          {
            $gte: [
              { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              { $dateToString: { format: "%Y-%m-%d", date: startDate } }
            ]
          },
          {
            $lte: [
              { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              { $dateToString: { format: "%Y-%m-%d", date: endDate } }
            ]
          }
        ]
      }
    }).exec();

    if (countByCreatedAt > 0) {
      return countByCreatedAt;
    }

    // Se não houver dados por createdAt, tenta por dataHora (apenas data)
    return this.pregaoModel.countDocuments({
      $expr: {
        $and: [
          {
            $gte: [
              { $dateToString: { format: "%Y-%m-%d", date: "$dataHora" } },
              { $dateToString: { format: "%Y-%m-%d", date: startDate } }
            ]
          },
          {
            $lte: [
              { $dateToString: { format: "%Y-%m-%d", date: "$dataHora" } },
              { $dateToString: { format: "%Y-%m-%d", date: endDate } }
            ]
          }
        ]
      }
    }).exec();
  }

  async getFinancialSummaryByDateRange(dataInicial: Date, dataFinal: Date): Promise<{
    investimentoTotal: number;
    lucroBrutoTotal: number;
    lucroLiquidoTotal: number;
    roiMedio: number;
  }> {
    // Configurar apenas ano, mês e dia (ignorando horas)
    const startDate = new Date(dataInicial);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(dataFinal);
    endDate.setUTCHours(23, 59, 59, 999);

    // Primeiro tenta por createdAt (comparando apenas a data)
    let aggregation = await this.pregaoModel.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $gte: [
                  { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  { $dateToString: { format: "%Y-%m-%d", date: startDate } }
                ]
              },
              {
                $lte: [
                  { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  { $dateToString: { format: "%Y-%m-%d", date: endDate } }
                ]
              }
            ]
          }
        },
      },
      {
        $group: {
          _id: null,
          investimentoTotal: { $sum: '$resultado.investimento' },
          lucroBrutoTotal: { $sum: '$resultado.valorBruto' },
          lucroLiquidoTotal: { $sum: '$resultado.valorLiquido' },
          roiMedio: { $avg: '$resultado.roi' },
        },
      },
    ]).exec();

    // Se não houver dados por createdAt, tenta por dataHora (apenas data)
    if (aggregation.length === 0) {
      aggregation = await this.pregaoModel.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: [
                    { $dateToString: { format: "%Y-%m-%d", date: "$dataHora" } },
                    { $dateToString: { format: "%Y-%m-%d", date: startDate } }
                  ]
                },
                {
                  $lte: [
                    { $dateToString: { format: "%Y-%m-%d", date: "$dataHora" } },
                    { $dateToString: { format: "%Y-%m-%d", date: endDate } }
                  ]
                }
              ]
            }
          },
        },
        {
          $group: {
            _id: null,
            investimentoTotal: { $sum: '$resultado.investimento' },
            lucroBrutoTotal: { $sum: '$resultado.valorBruto' },
            lucroLiquidoTotal: { $sum: '$resultado.valorLiquido' },
            roiMedio: { $avg: '$resultado.roi' },
          },
        },
      ]).exec();
    }

    if (aggregation.length === 0) {
      return {
        investimentoTotal: 0,
        lucroBrutoTotal: 0,
        lucroLiquidoTotal: 0,
        roiMedio: 0,
      };
    }

    const result = aggregation[0];
    return {
      investimentoTotal: result.investimentoTotal || 0,
      lucroBrutoTotal: result.lucroBrutoTotal || 0,
      lucroLiquidoTotal: result.lucroLiquidoTotal || 0,
      roiMedio: result.roiMedio || 0,
    };
  }
}

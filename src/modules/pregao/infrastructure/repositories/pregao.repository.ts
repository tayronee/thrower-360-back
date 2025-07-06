import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pregao } from '../../domain/entities/pregao.entity';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';
import { PregaoDocument } from '../../interfaces/schemas/pregao.schema';

@Injectable()
export class PregaoRepository implements IPregaoRepository {
  constructor(
    @InjectModel(Pregao.name) private readonly pregaoModel: Model<PregaoDocument>,
  ) {}

  async create(pregao: Pregao): Promise<Pregao> {
    const created = new this.pregaoModel(pregao);
    const doc = await created.save();
    return {
      id: doc._id.toString(),
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
    }));
  }

  async updateByIdReferencia(idReferencia: string, data: Partial<Pregao>): Promise<Pregao | null> {
    const updated = await this.pregaoModel.findOneAndUpdate(
      { idReferencia },
      data,
      { new: true }
    ).lean();
    return updated as Pregao | null;
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
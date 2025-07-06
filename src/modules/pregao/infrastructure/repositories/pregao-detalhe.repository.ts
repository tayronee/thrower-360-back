import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PregaoDetalhe } from '../../domain/entities/pregao-detalhe.entity';
import { PregaoComItens } from '../../domain/entities/pregao-com-itens.entity';
import { IPregaoDetalheRepository } from '../../domain/repositories/pregao-detalhe.repository.interface';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';
import { PregaoDetalheDocument, PregaoDetalheModelName } from '../../interfaces/schemas/pregao-detalhe.schema';

@Injectable()
export class PregaoDetalheRepository implements IPregaoDetalheRepository {
  constructor(
    @InjectModel(PregaoDetalheModelName) private readonly detalheModel: Model<PregaoDetalheDocument>,
    @Inject('IPregaoRepository') private readonly pregaoRepository: IPregaoRepository,
  ) {}

  async create(data: PregaoDetalhe): Promise<PregaoDetalhe> {
    const created = await this.detalheModel.create(data);
    return {
      id: created.id,
      numeroPregao: created.numeroPregao,
      estado: created.estado,
      cidade: created.cidade,
      detalhes: created.detalhes,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async findAll(): Promise<PregaoDetalhe[]> {
    const docs = await this.detalheModel.find().lean().exec();
    return docs.map((doc: any) => ({
      id: doc._id?.toString(),
      numeroPregao: doc.numeroPregao,
      estado: doc.estado,
      cidade: doc.cidade,
      detalhes: doc.detalhes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async findById(id: string): Promise<PregaoDetalhe | null> {
    // Verifica se o ID é um ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await this.detalheModel.findById(id).lean().exec();
    
    if (!doc) {
      return null;
    }

    return {
      id: doc._id?.toString(),
      numeroPregao: doc.numeroPregao,
      estado: doc.estado,
      cidade: doc.cidade,
      detalhes: doc.detalhes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async update(id: string, data: Partial<PregaoDetalhe>): Promise<PregaoDetalhe | null> {
    // Verifica se o ID é um ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updated = await this.detalheModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();

    if (!updated) {
      return null;
    }

    return {
      id: updated._id?.toString(),
      numeroPregao: updated.numeroPregao,
      estado: updated.estado,
      cidade: updated.cidade,
      detalhes: updated.detalhes,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async findAllWithItems(): Promise<PregaoComItens[]> {
    const pregoes = await this.findAll();
    const pregoesComItens: PregaoComItens[] = [];

    for (const pregao of pregoes) {
      const itens = await this.pregaoRepository.findByNumeroPregao(pregao.numeroPregao);
      pregoesComItens.push({
        pregao,
        itens,
      });
    }

    return pregoesComItens;
  }

  async findByIdWithItems(id: string): Promise<PregaoComItens | null> {
    const pregao = await this.findById(id);
    
    if (!pregao) {
      return null;
    }

    const itens = await this.pregaoRepository.findByNumeroPregao(pregao.numeroPregao);
    
    return {
      pregao,
      itens,
    };
  }

  async countByDateRange(dataInicial: Date, dataFinal: Date): Promise<number> {
    // Configurar apenas ano, mês e dia (ignorando horas)
    const startDate = new Date(dataInicial);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(dataFinal);
    endDate.setUTCHours(23, 59, 59, 999);

    // Filtra por createdAt comparando apenas a data (sem horas)
    const count = await this.detalheModel.countDocuments({
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

    return count;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';
import { Pregao } from '../../domain/entities/pregao.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreatePregaoUseCase {
  constructor(
    @Inject('IPregaoRepository')
    private readonly pregaoRepository: IPregaoRepository,
  ) {}

  async execute(data: Omit<Pregao, 'id' | 'idReferencia'>): Promise<Pregao> {
    const pregao: Pregao = {
      idPregao: data.idPregao,
      idReferencia: randomUUID(),
      statusPregao: data.statusPregao,
      numeroPregao: data.numeroPregao,
      nomeProduto: data.nomeProduto,
      quantidade: data.quantidade,
      valorUnitarioCompra: data.valorUnitarioCompra,
      valorUnitarioVenda: data.valorUnitarioVenda,
      percentualAlvo: data.percentualAlvo,
      valorMinimo: data.valorMinimo,
      percentualMinimo: data.percentualMinimo,
      icms: data.icms,
      fcp: data.fcp,
      logistica: data.logistica,
      resultado: data.resultado,
      dataHora: data.dataHora,
    };

    return this.pregaoRepository.create(pregao);
  }
}

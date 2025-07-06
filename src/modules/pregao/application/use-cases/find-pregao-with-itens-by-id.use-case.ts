import { Injectable, Inject } from '@nestjs/common';
import { IPregaoDetalheRepository } from '../../domain/repositories/pregao-detalhe.repository.interface';
import { PregaoComItens } from '../../domain/entities/pregao-com-itens.entity';

@Injectable()
export class FindPregaoWithItensByIdUseCase {
  constructor(
    @Inject('IPregaoDetalheRepository')
    private readonly repository: IPregaoDetalheRepository,
  ) {}

  async execute(id: string): Promise<PregaoComItens | null> {
    return this.repository.findByIdWithItems(id);
  }
}

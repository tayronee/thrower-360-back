import { Injectable, Inject } from '@nestjs/common';
import { IPregaoDetalheRepository } from '../../domain/repositories/pregao-detalhe.repository.interface';
import { PregaoDetalhe } from '../../domain/entities/pregao-detalhe.entity';

@Injectable()
export class UpdatePregaoDetalheUseCase {
  constructor(
    @Inject('IPregaoDetalheRepository')
    private readonly repository: IPregaoDetalheRepository,
  ) {}

  async execute(id: string, data: Partial<PregaoDetalhe>): Promise<PregaoDetalhe | null> {
    return this.repository.update(id, data);
  }
}

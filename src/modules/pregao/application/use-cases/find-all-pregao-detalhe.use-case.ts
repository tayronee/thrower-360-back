import { Injectable, Inject } from '@nestjs/common';
import { IPregaoDetalheRepository } from '../../domain/repositories/pregao-detalhe.repository.interface';
import { PregaoDetalhe } from '../../domain/entities/pregao-detalhe.entity';

@Injectable()
export class FindAllPregaoDetalheUseCase {
  constructor(
    @Inject('IPregaoDetalheRepository')
    private readonly repository: IPregaoDetalheRepository,
  ) {}

  async execute(): Promise<PregaoDetalhe[]> {
    return this.repository.findAll();
  }
}

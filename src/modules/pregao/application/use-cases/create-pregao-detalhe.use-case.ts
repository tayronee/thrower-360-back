import { Injectable, Inject } from '@nestjs/common';
import { IPregaoDetalheRepository } from '../../domain/repositories/pregao-detalhe.repository.interface';
import { PregaoDetalhe } from '../../domain/entities/pregao-detalhe.entity';

@Injectable()
export class CreatePregaoDetalheUseCase {
  constructor(
    @Inject('IPregaoDetalheRepository')
    private readonly detalheRepository: IPregaoDetalheRepository,
  ) {}

  async execute(data: PregaoDetalhe): Promise<PregaoDetalhe> {
    return this.detalheRepository.create(data);
  }
}

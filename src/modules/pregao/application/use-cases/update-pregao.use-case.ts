import { Injectable, Inject } from '@nestjs/common';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';
import { Pregao } from '../../domain/entities/pregao.entity';

@Injectable()
export class UpdatePregaoUseCase {
  constructor(
    @Inject('IPregaoRepository')
    private readonly pregaoRepository: IPregaoRepository,
  ) {}

  async execute(idReferencia: string, data: Partial<Pregao>): Promise<Pregao | null> {
    return this.pregaoRepository.updateByIdReferencia(idReferencia, data);
  }
}

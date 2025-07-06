import { Injectable, Inject } from '@nestjs/common';
import { IPregaoRepository } from '../../domain/repositories/pregao.repository.interface';
import { Pregao } from '../../domain/entities/pregao.entity';

@Injectable()
export class FindAllPregoesUseCase {
  constructor(
    @Inject('IPregaoRepository')
    private readonly pregaoRepository: IPregaoRepository,
  ) {}

  async execute(): Promise<Pregao[]> {
    return this.pregaoRepository.findAll();
  }
}

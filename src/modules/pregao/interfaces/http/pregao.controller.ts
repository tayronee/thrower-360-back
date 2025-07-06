import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { CreatePregaoUseCase } from '../../application/use-cases/create-pregao.use-case';
import { FindAllPregoesUseCase } from '../../application/use-cases/find-all-pregoes.usecase';
import { UpdatePregaoUseCase } from '../../application/use-cases/update-pregao.use-case';
import { CreatePregaoDto } from '../dtos/create-pregao.dto';
import { UpdatePregaoDto } from '../dtos/update-pregao.dto';
import { Pregao } from '../../domain/entities/pregao.entity';

@Controller('itens-pregao')
export class PregaoController {
  constructor(
    private readonly createPregaoUseCase: CreatePregaoUseCase,
    private readonly findAllPregoesUseCase: FindAllPregoesUseCase,
    private readonly updatePregaoUseCase: UpdatePregaoUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePregaoDto): Promise<Pregao> {
    return this.createPregaoUseCase.execute({
      ...dto,
      dataHora: new Date(dto.dataHora),
    });
  }

  @Get()
  async findAll(): Promise<Pregao[]> {
    return this.findAllPregoesUseCase.execute();
  }

  @Patch(':idReferencia')
  async update(
    @Param('idReferencia') idReferencia: string,
    @Body() dto: UpdatePregaoDto,
  ) {
    const data: any = { ...dto };
    if (data.dataHora) {
      data.dataHora = new Date(data.dataHora);
    }
    return this.updatePregaoUseCase.execute(idReferencia, data);
  }
}
import { Controller, Post, Body, Get, Patch, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePregaoDetalheUseCase } from '../../application/use-cases/create-pregao-detalhe.use-case';
import { FindAllPregaoDetalheUseCase } from '../../application/use-cases/find-all-pregao-detalhe.use-case';
import { FindPregaoDetalheByIdUseCase } from '../../application/use-cases/find-pregao-detalhe-by-id.use-case';
import { FindAllPregoesWithItensUseCase } from '../../application/use-cases/find-all-pregoes-with-itens.use-case';
import { FindPregaoWithItensByIdUseCase } from '../../application/use-cases/find-pregao-with-itens-by-id.use-case';
import { UpdatePregaoDetalheUseCase } from '../../application/use-cases/update-pregao-detalhe.use-case';
import { PregaoDetalhe } from '../../domain/entities/pregao-detalhe.entity';
import { PregaoComItens } from '../../domain/entities/pregao-com-itens.entity';
import { CreatePregaoDetalheDto } from '../dtos/create-pregao-detalhe.dto';
import { UpdatePregaoDetalheDto } from '../dtos/update-pregao-detalhe.dto';
import { Types } from 'mongoose';

@Controller('pregoes')
export class PregaoDetalheController {
  constructor(
    private readonly createUseCase: CreatePregaoDetalheUseCase,
    private readonly findAllUseCase: FindAllPregaoDetalheUseCase,
    private readonly findByIdUseCase: FindPregaoDetalheByIdUseCase,
    private readonly findAllWithItensUseCase: FindAllPregoesWithItensUseCase,
    private readonly findWithItensByIdUseCase: FindPregaoWithItensByIdUseCase,
    private readonly updateUseCase: UpdatePregaoDetalheUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePregaoDetalheDto): Promise<PregaoDetalhe> {
    return this.createUseCase.execute(dto);
  }

  @Get()
  async findAll(): Promise<PregaoDetalhe[]> {
    return this.findAllUseCase.execute();
  }

  @Get('with-itens')
  async findAllWithItens(): Promise<PregaoComItens[]> {
    return this.findAllWithItensUseCase.execute();
  }

  @Get(':id/with-itens')
  async findByIdWithItens(@Param('id') id: string): Promise<PregaoComItens> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID inválido: ${id}. Deve ser um ObjectId válido do MongoDB.`);
    }

    const pregaoComItens = await this.findWithItensByIdUseCase.execute(id);
    
    if (!pregaoComItens) {
      throw new NotFoundException(`Pregão com ID ${id} não encontrado`);
    }
    
    return pregaoComItens;
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PregaoDetalhe> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID inválido: ${id}. Deve ser um ObjectId válido do MongoDB.`);
    }

    const pregao = await this.findByIdUseCase.execute(id);
    
    if (!pregao) {
      throw new NotFoundException(`Pregão com ID ${id} não encontrado`);
    }
    
    return pregao;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePregaoDetalheDto,
  ): Promise<PregaoDetalhe> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID inválido: ${id}. Deve ser um ObjectId válido do MongoDB.`);
    }

    const updated = await this.updateUseCase.execute(id, dto);
    
    if (!updated) {
      throw new NotFoundException(`Pregão com ID ${id} não encontrado`);
    }
    
    return updated;
  }
}

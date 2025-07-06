import { PregaoDetalhe } from '../entities/pregao-detalhe.entity';
import { PregaoComItens } from '../entities/pregao-com-itens.entity';

export interface IPregaoDetalheRepository {
  create(data: PregaoDetalhe): Promise<PregaoDetalhe>;
  findAll(): Promise<PregaoDetalhe[]>;
  findById(id: string): Promise<PregaoDetalhe | null>;
  findByIdWithItems(id: string): Promise<PregaoComItens | null>;
  findAllWithItems(): Promise<PregaoComItens[]>;
  countByDateRange(dataInicial: Date, dataFinal: Date): Promise<number>;
  update(id: string, data: Partial<PregaoDetalhe>): Promise<PregaoDetalhe | null>;
}

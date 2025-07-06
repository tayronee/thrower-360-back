import { PregaoDetalhe } from './pregao-detalhe.entity';
import { Pregao } from './pregao.entity';

export class PregaoComItens {
  pregao!: PregaoDetalhe;
  itens!: Pregao[];
}

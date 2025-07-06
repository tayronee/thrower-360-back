import { PartialType } from '@nestjs/mapped-types';
import { CreatePregaoDto } from './create-pregao.dto';

export class UpdatePregaoDto extends PartialType(CreatePregaoDto) {
  statusPregao?: string;
}

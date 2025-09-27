import { PartialType } from '@nestjs/mapped-types';
import { CreateAvaliacaoDto } from './create-avaliacoe.dto';

export class UpdateAvaliacaoDto extends PartialType(CreateAvaliacaoDto) {}

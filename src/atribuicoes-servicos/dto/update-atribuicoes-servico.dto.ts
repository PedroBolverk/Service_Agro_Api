import { IsEnum, IsOptional, IsDate } from 'class-validator';
import { StatusAtribuicao } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateAtribuicaoServicoDto {
  @IsOptional()
  @IsEnum(StatusAtribuicao)
  status?: StatusAtribuicao;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  decidedAt?: Date;
}

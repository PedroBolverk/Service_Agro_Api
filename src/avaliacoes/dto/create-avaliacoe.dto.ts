import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAvaliacaoDto {
  @IsString() mechanicId: string;             // Mechanic.userId
  @IsString() producerId: string;             // Users.id
  @IsString() solicitacaoServicoId: string;
  @IsInt() @Min(1) @Max(5) score: number;
  @IsOptional() @IsString() comment?: string;
}

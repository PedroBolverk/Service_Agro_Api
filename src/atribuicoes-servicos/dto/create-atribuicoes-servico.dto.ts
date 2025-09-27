import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusAtribuicao } from '@prisma/client';


export class CreateAtribuicaoServicoDto {
@IsString() solicitacaoServicoId: string;
@IsString() mechanicId: string; // Users.id do mecânico
@IsOptional() @IsEnum(StatusAtribuicao) status?: StatusAtribuicao;
}
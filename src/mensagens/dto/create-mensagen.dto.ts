import { IsString } from 'class-validator';

export class CreateMensagemDto {
  @IsString() solicitacaoServicoId: string;
  @IsString() senderId: string;   // Users.id
  @IsString() content: string;
}

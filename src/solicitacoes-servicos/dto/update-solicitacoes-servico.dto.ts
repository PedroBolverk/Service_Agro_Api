import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitacaoServicoDto } from './create-solicitacoes-servico.dto';

export class UpdateSolicitacoesServicoDto extends PartialType(CreateSolicitacaoServicoDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateAtribuicaoServicoDto } from './create-atribuicoes-servico.dto';
export class UpdateAtribuicaoServicoDto extends PartialType(CreateAtribuicaoServicoDto) { }
import { PartialType } from '@nestjs/mapped-types';
import { CreateMensagemDto } from './create-mensagen.dto';

export class UpdateMensagemDto extends PartialType(CreateMensagemDto) {}

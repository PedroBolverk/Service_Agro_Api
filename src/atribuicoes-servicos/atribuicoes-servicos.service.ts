import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusAtribuicao, RequestStatus } from '@prisma/client';
import { CreateAtribuicaoServicoDto } from './dto/create-atribuicoes-servico.dto';
import { UpdateAtribuicaoServicoDto } from './dto/update-atribuicoes-servico.dto';

@Injectable()
export class AtribuicoesServicosService {
constructor(private prisma: PrismaService) {}


async create(dto: CreateAtribuicaoServicoDto) {
// validação básica
const sol = await this.prisma.solicitacaoServicos.findUnique({ where: { id: dto.solicitacaoServicoId } });
if (!sol) throw new BadRequestException('Solicitação inválida');
const mech = await this.prisma.users.findUnique({ where: { id: dto.mechanicId } });
if (!mech) throw new BadRequestException('Mecânico inválido');


const atrib = await this.prisma.atribuicaoServicos.create({
data: {
solicitacaoServicoId: dto.solicitacaoServicoId,
mechanicId: dto.mechanicId,
status: dto.status ?? StatusAtribuicao.PENDENTE,
},
});
return atrib;
}


findAll() { return this.prisma.atribuicaoServicos.findMany(); }
async findOne(id: string) {
const a = await this.prisma.atribuicaoServicos.findUnique({ where: { id } });
if (!a) throw new NotFoundException('Atribuição não encontrada');
return a;
}
update(id: string, dto: UpdateAtribuicaoServicoDto) {
return this.prisma.atribuicaoServicos.update({ where: { id }, data: dto });
}
remove(id: string) { return this.prisma.atribuicaoServicos.delete({ where: { id } }); }


aceitar(id: string) {
return this.prisma.$transaction(async (tx) => {
const atrib = await tx.atribuicaoServicos.update({ where: { id }, data: { status: StatusAtribuicao.ACEITA, decidedAt: new Date() } });
await tx.solicitacaoServicos.update({ where: { id: atrib.solicitacaoServicoId }, data: { status: RequestStatus.ATRIBUIDA } });
return atrib;
});
}
recusar(id: string) {
return this.prisma.atribuicaoServicos.update({ where: { id }, data: { status: StatusAtribuicao.RECUSADA, decidedAt: new Date() } });
}
}
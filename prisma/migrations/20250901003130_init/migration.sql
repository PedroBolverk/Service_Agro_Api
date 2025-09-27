-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('PRODUCER', 'MECHANIC');

-- CreateEnum
CREATE TYPE "public"."StatusAtribuicao" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('ABERTA', 'ATRIBUIDA', 'CANCELADA', 'CONCLUIDA');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "phone" TEXT,
    "cpfCnpj" TEXT,
    "stateReg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mechanic" (
    "userId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."SolicitacaoServicos" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "machineType" TEXT,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "scheduledFor" TIMESTAMP(3),
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoServicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AtribuicaoServicos" (
    "id" TEXT NOT NULL,
    "solicitacaoServicoId" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "status" "public"."StatusAtribuicao" NOT NULL DEFAULT 'PENDENTE',
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtribuicaoServicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "solicitacaoServicoId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rating" (
    "id" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "solicitacaoServicoId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- AddForeignKey
ALTER TABLE "public"."Mechanic" ADD CONSTRAINT "Mechanic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolicitacaoServicos" ADD CONSTRAINT "SolicitacaoServicos_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AtribuicaoServicos" ADD CONSTRAINT "AtribuicaoServicos_solicitacaoServicoId_fkey" FOREIGN KEY ("solicitacaoServicoId") REFERENCES "public"."SolicitacaoServicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AtribuicaoServicos" ADD CONSTRAINT "AtribuicaoServicos_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_solicitacaoServicoId_fkey" FOREIGN KEY ("solicitacaoServicoId") REFERENCES "public"."SolicitacaoServicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "public"."Mechanic"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_solicitacaoServicoId_fkey" FOREIGN KEY ("solicitacaoServicoId") REFERENCES "public"."SolicitacaoServicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

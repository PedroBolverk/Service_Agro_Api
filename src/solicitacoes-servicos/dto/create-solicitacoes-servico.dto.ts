import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class CreateSolicitacaoServicoDto {
  @IsString()
  producerId: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  machineType?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string; // ISO Date String

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus = RequestStatus.ABERTA; // Default to 'ABERTA' if not provided
}
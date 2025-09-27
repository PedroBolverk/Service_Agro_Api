import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUsuarioDto {
  // dados do usuário
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() fullName: string;
  @IsEnum(Role) role: Role;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() cpfCnpj?: string;
  @IsOptional() @IsString() stateReg?: string;

  // dados do mecânico (para role=MECHANIC)
  @ValidateIf(o => o.role === Role.MECHANIC)
  @IsString()
  mechanicSpecialty?: string;       // obrigatório se MECHANIC

  @IsOptional() @IsString()
  mechanicPhotoUrl?: string;        // opcional

  @IsOptional() @IsBoolean()
  mechanicIsAvailable?: boolean;

  @IsOptional() @IsNumber()
  mechanicLat?: number;

  @IsOptional() @IsNumber()
  mechanicLng?: number;
}

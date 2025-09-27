import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  // role é IMUTÁVEL na sua app - não exponha aqui
  @IsOptional() @IsString() @MinLength(6)
  password?: string;

  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  cpfCnpj?: string;

  @IsOptional() @IsString()
  stateReg?: string;
}

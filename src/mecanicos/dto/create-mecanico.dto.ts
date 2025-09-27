import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMecanicoDto {
  @IsString() @IsNotEmpty()
  userId: string;            // referencia Users.id (PK de Mechanic também)

  @IsString()
  specialty: string;

  @IsString()
  photoUrl: string;

  @IsOptional() @IsBoolean()
  isAvailable?: boolean;

  @IsOptional() @IsNumber()
  lat?: number;

  @IsOptional() @IsNumber()
  lng?: number;
}

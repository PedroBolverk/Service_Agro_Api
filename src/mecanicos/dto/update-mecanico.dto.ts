import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMecanicoDto {
  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}

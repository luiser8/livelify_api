import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DiagnosticScoresDto {
  @ApiProperty({
    example: 5,
    description: 'Personal area score',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  personal: number;

  @ApiProperty({
    example: 10,
    description: 'Professional area score',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  professional: number;

  @ApiProperty({
    example: 3,
    description: 'Health area score',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  health: number;

  @ApiProperty({
    example: 5,
    description: 'Finances area score',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  finances: number;

  @ApiProperty({
    example: 7,
    description: 'Family area score',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  family: number;

  @ApiProperty({
    example: 7,
    description: 'Love area score',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  love: number;
}

export class SendDiagnosticDto {
  @ApiProperty({
    example: {
      personal: 5,
      professional: 10,
      health: 3,
      finances: 5,
      family: 7,
      love: 7,
    },
    description: 'Scores for each life area',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DiagnosticScoresDto)
  scores: DiagnosticScoresDto;

  @ApiProperty({ example: 'Nombre del usuario', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'correo@ejemplo.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 6.2,
    description: 'Average score',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  average: number;
}

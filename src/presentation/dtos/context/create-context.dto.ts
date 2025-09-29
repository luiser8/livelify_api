import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserContextDto {
  @ApiProperty({
    description: 'Context name',
    example: 'Office',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class ContextResponseDto {
  @ApiProperty({
    description: 'Context ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Context name',
    example: 'Office',
  })
  name: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CreateUserContextResponseDto {
  @ApiProperty({
    description: 'Created context information',
    type: ContextResponseDto,
  })
  context: ContextResponseDto;
}

export class GetUserContextsResponseDto {
  @ApiProperty({
    description: 'List of user contexts',
    type: [ContextResponseDto],
  })
  contexts: ContextResponseDto[];

  @ApiProperty({
    description: 'Total number of contexts',
    example: 5,
  })
  totalContexts: number;
}

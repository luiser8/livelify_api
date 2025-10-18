import { ApiProperty } from '@nestjs/swagger';

export class CreateUserContextResponseDto {
  @ApiProperty({
    description: 'Context ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '987e6543-e21b-98d7-b654-321456789012',
  })
  userId: string;

  @ApiProperty({
    description: 'Context name',
    example: '@Office',
  })
  name: string;

  @ApiProperty({
    description:
      'Indicates if the context can be deleted (always true for new contexts)',
    example: true,
  })
  canDelete: boolean;

  @ApiProperty({
    description: 'Number of actions associated (always 0 for new contexts)',
    example: 0,
  })
  actionsCount: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-10-10T12:00:00.000Z',
  })
  createdAt: Date;
}

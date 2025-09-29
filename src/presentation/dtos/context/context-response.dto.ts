import { ApiProperty } from '@nestjs/swagger';

export class UserContextResponseDto {
  @ApiProperty({
    description: 'Context ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Context name',
    example: '@Office',
  })
  name: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-09-29T02:00:13.365Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-09-29T02:00:13.365Z',
  })
  updatedAt: Date;
}

export class GetUserContextsResponseDto {
  @ApiProperty({
    description: 'List of user contexts',
    type: [UserContextResponseDto],
  })
  contexts: UserContextResponseDto[];
}

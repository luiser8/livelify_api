import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserContextResponseDto {
  @ApiProperty({
    description: 'Indicates if the deletion was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Deletion message',
    example: 'Context deleted successfully',
  })
  message: string;
}

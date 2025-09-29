import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserContextDto {
  // @ApiProperty({
  //   description: 'User ID',
  //   example: 'user-id-123',
  // })
  // @IsString()
  // userId: string;

  @ApiProperty({
    description: 'Name of the context',
    example: 'My Context',
  })
  @IsString()
  name: string;

  // @ApiProperty({
  //   description: 'Actions associated with the context',
  //   example: 'My Context',
  // })
  // @IsString({ each: true })
  // actions?: string[];
}

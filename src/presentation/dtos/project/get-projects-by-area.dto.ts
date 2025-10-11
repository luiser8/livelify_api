import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetProjectsByAreaQueryDto {
  @ApiProperty({
    description: 'LifeWheelArea ID to filter projects',
    example: 'cf002c9f-33dc-4ae6-b2f1-e6dd1c06c02c',
  })
  @IsNotEmpty()
  @IsUUID()
  area: string;
}

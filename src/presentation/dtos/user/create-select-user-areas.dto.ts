/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { AreaSelection } from 'src/application/use-cases/user/create-select-user-areas.use-case';

export class CreateSelectUserAreasDto {
  @ApiProperty({
    description: 'User Id to be selected by the user.',
    type: String,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })

  @IsString()
  userId: string | null | '';

  @ApiProperty({
    description: 'Array of Area IDs to be selected by the user.',
    example: [
      {
        areaId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        score: 8.7,
      },
      {
        areaId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
        score: 9.2,
      },
    ],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  areaIds: AreaSelection[];

  @ApiProperty({
    description: 'lifeWheel Id to be selected by the user.',
    type: String,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  lifeWheelId: string;
}

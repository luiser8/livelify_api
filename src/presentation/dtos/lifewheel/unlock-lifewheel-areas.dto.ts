import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UnlockLifeWheelAreasDto {
  @ApiProperty({
    description: 'Array of LifeWheelArea IDs to unlock (exactly 3)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    type: [String],
  })
  @IsArray()
  // @ArrayMinSize(3, { message: 'You must select exactly 3 areas to unlock' })
  // @ArrayMaxSize(3, { message: 'You must select exactly 3 areas to unlock' })
  @IsUUID('4', { each: true, message: 'Each area ID must be a valid UUID' })
  lifeWheelAreaIds: string[];
}

export class UnlockLifeWheelAreasResponseDto {
  @ApiProperty({
    description: 'Number of areas unlocked',
    example: 3,
  })
  unlockedCount: number;

  @ApiProperty({
    description: 'IDs of the unlocked areas',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    type: [String],
  })
  unlockedAreaIds: string[];

  @ApiProperty({
    description: 'Success message',
    example: 'Successfully unlocked 3 areas for project creation',
  })
  message: string;
}

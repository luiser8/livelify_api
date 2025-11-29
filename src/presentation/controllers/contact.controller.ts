import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { PublicThrottle } from '../decorators/throttle.decorator';
import { AddContactDto } from '../dtos/contact';
import { AddContactUseCase } from '../../application/use-cases/contact/add-contact.use-case';
import { ApiKeyGuard } from '../guards/api-key.guard';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactController {
  constructor(private readonly addContactUseCase: AddContactUseCase) {}

  @Post('add')
  @Public()
  @PublicThrottle()
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Api-Key',
    description: 'API key for contact endpoint',
    required: true,
  })
  @ApiOperation({
    summary: 'Add contact to SendGrid marketing list',
    description:
      'Public endpoint to receive contact data from sales website and add it to SendGrid marketing list without sending email',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact added successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact added to SendGrid successfully',
        addedToSendGrid: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async addContact(@Body() dto: AddContactDto) {
    return await this.addContactUseCase.execute({
      name: dto.name,
      email: dto.email,
    });
  }
}

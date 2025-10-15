/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Get,
  Res,
  NotFoundException,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { Public } from '../decorators/public.decorator';
import { PublicThrottle } from '../decorators/throttle.decorator';

// Idiomas soportados
enum Language {
  ES = 'ES',
  EN = 'EN',
}

// Tipos de archivo soportados
enum FileType {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  private readonly supportedLanguages = Object.values(Language);
  private readonly supportedFileTypes = Object.values(FileType);

  @Get(':type/:lang')
  @Public()
  @PublicThrottle()
  @ApiOperation({
    summary: 'Obtener PDF por tipo e idioma',
    description:
      'Descarga el archivo PDF según el tipo (términos y condiciones o políticas de privacidad) en el idioma especificado. Este es un endpoint público que no requiere autenticación.',
  })
  @ApiParam({
    name: 'type',
    enum: FileType,
    description:
      'Tipo de documento (terms = Términos y Condiciones, privacy = Políticas de Privacidad)',
    example: 'terms',
  })
  @ApiParam({
    name: 'lang',
    enum: Language,
    description: 'Idioma del PDF (ES = Español, EN = Inglés)',
    example: 'ES',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF descargado correctamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tipo de archivo o idioma no soportado',
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo PDF no encontrado para el tipo e idioma especificado',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async getDocumentPdf(
    @Param('type') type: string,
    @Param('lang') lang: string,
    @Res() res: Response,
  ): Promise<void> {
    // Convertir a minúsculas y validar tipo de archivo
    const fileType = type.toLowerCase();
    if (!this.supportedFileTypes.includes(fileType as FileType)) {
      throw new BadRequestException(
        `Tipo de archivo no soportado. Tipos disponibles: ${this.supportedFileTypes.join(', ')}`,
      );
    }

    // Convertir a mayúsculas y validar idioma
    const language = lang.toUpperCase();
    if (!this.supportedLanguages.includes(language as Language)) {
      throw new BadRequestException(
        `Idioma no soportado. Idiomas disponibles: ${this.supportedLanguages.join(', ')}`,
      );
    }

    // Determinar el nombre del archivo según el tipo
    let fileName: string;
    if (fileType === FileType.TERMS) {
      fileName = `t_&&_c_${language}.pdf`;
    } else {
      fileName = `p_&&_p_${language}.pdf`;
    }

    const filePath = join(process.cwd(), 'docs', fileName);

    // Verificar si el archivo existe
    if (!existsSync(filePath)) {
      const documentType =
        fileType === FileType.TERMS
          ? 'términos y condiciones'
          : 'políticas de privacidad';
      throw new NotFoundException(
        `El archivo de ${documentType} no se encuentra disponible para el idioma ${language}`,
      );
    }

    // Configurar headers para servir el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Enviar el archivo
    res.sendFile(filePath);
  }

  // Endpoint específico para términos y condiciones (backward compatibility)
  @Get('terms/:lang')
  @Public()
  @PublicThrottle()
  @ApiOperation({
    summary: 'Obtener PDF de Términos y Condiciones por Idioma',
    description:
      'Descarga el archivo PDF con los términos y condiciones en el idioma especificado. Este es un endpoint público que no requiere autenticación.',
  })
  @ApiParam({
    name: 'lang',
    enum: Language,
    description: 'Idioma del PDF (ES = Español, EN = Inglés)',
    example: 'ES',
  })
  async getTermsPdf(
    @Param('lang') lang: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.getDocumentPdf(FileType.TERMS, lang, res);
  }

  // Endpoint específico para políticas de privacidad
  @Get('privacy/:lang')
  @Public()
  @PublicThrottle()
  @ApiOperation({
    summary: 'Obtener PDF de Políticas de Privacidad por Idioma',
    description:
      'Descarga el archivo PDF con las políticas de privacidad en el idioma especificado. Este es un endpoint público que no requiere autenticación.',
  })
  @ApiParam({
    name: 'lang',
    enum: Language,
    description: 'Idioma del PDF (ES = Español, EN = Inglés)',
    example: 'ES',
  })
  async getPrivacyPdf(
    @Param('lang') lang: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.getDocumentPdf(FileType.PRIVACY, lang, res);
  }
}

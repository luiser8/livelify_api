export class AvatarUrl {
  private readonly value: string;
  private readonly protocol: string;
  private readonly domain: string;
  private readonly path: string;
  private readonly fileExtension: string;

  constructor(url: string) {
    const trimmedUrl = url.trim();
    if (!this.isValid(trimmedUrl)) {
      throw new Error(
        'Invalid avatar URL. Must be a valid HTTPS URL pointing to an image file',
      );
    }

    this.value = trimmedUrl;
    const parsed = this.parseUrl(trimmedUrl);
    this.protocol = parsed.protocol;
    this.domain = parsed.domain;
    this.path = parsed.path;
    this.fileExtension = parsed.fileExtension;
  }

  public getValue(): string {
    return this.value;
  }

  public getProtocol(): string {
    return this.protocol;
  }

  public getDomain(): string {
    return this.domain;
  }

  public getPath(): string {
    return this.path;
  }

  public getFileExtension(): string {
    return this.fileExtension;
  }

  public isImageFile(): boolean {
    const imageExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'bmp',
      'ico',
    ];
    return imageExtensions.includes(this.fileExtension.toLowerCase());
  }

  public isSecure(): boolean {
    return this.protocol === 'https:';
  }

  private isValid(url: string): boolean {
    try {
      const urlObj = new URL(url);

      // Must be HTTPS for security
      if (urlObj.protocol !== 'https:') {
        return false;
      }

      // Must have a valid domain
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return false;
      }

      // Must point to an image file (optional but recommended)
      const pathname = urlObj.pathname.toLowerCase();
      const imageExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'bmp',
        'ico',
      ];
      const hasImageExtension = imageExtensions.some((ext) =>
        pathname.endsWith(`.${ext}`),
      );

      // Either has image extension or is from known image hosting services
      const knownImageHosts = [
        'imgur.com',
        'cloudinary.com',
        'amazonaws.com',
        'googleusercontent.com',
        'github.com',
        'githubusercontent.com',
      ];
      const isKnownImageHost = knownImageHosts.some((host) =>
        urlObj.hostname.includes(host),
      );

      return (
        hasImageExtension ||
        isKnownImageHost ||
        pathname.includes('/avatar') ||
        pathname.includes('/profile')
      );
    } catch {
      return false;
    }
  }

  private parseUrl(url: string): {
    protocol: string;
    domain: string;
    path: string;
    fileExtension: string;
  } {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDot = pathname.lastIndexOf('.');
      const fileExtension = lastDot > 0 ? pathname.slice(lastDot + 1) : '';

      return {
        protocol: urlObj.protocol,
        domain: urlObj.hostname,
        path: pathname,
        fileExtension,
      };
    } catch {
      return {
        protocol: '',
        domain: '',
        path: '',
        fileExtension: '',
      };
    }
  }

  public equals(other: AvatarUrl): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public getThumbnailUrl(size: number = 150): string {
    // For some known services, we can generate thumbnail URLs
    if (this.domain.includes('cloudinary.com')) {
      // Cloudinary transformation
      return this.value.replace(
        '/upload/',
        `/upload/w_${size},h_${size},c_fill/`,
      );
    }

    if (this.domain.includes('imgur.com')) {
      // Imgur thumbnail (add 's' for small, 'm' for medium, 'l' for large)
      const size_suffix = size <= 160 ? 's' : size <= 320 ? 'm' : 'l';
      return this.value.replace(/\.(jpg|jpeg|png|gif)$/i, `${size_suffix}.$1`);
    }

    // For other services, return original URL
    return this.value;
  }

  public static create(url: string): AvatarUrl {
    return new AvatarUrl(url);
  }

  public static createOptional(url?: string): AvatarUrl | undefined {
    return url ? new AvatarUrl(url) : undefined;
  }
}

export class Phone {
  private readonly value: string;
  private readonly countryCode: string;
  private readonly nationalNumber: string;

  constructor(phone: string) {
    const cleanPhone = this.cleanPhoneNumber(phone);
    if (!this.isValid(cleanPhone)) {
      throw new Error(
        'Invalid phone number format. Expected format: +[country code][number] or local format with at least 10 digits',
      );
    }

    const parsed = this.parsePhoneNumber(cleanPhone);
    this.value = parsed.fullNumber;
    this.countryCode = parsed.countryCode;
    this.nationalNumber = parsed.nationalNumber;
  }

  public getValue(): string {
    return this.value;
  }

  public getCountryCode(): string {
    return this.countryCode;
  }

  public getNationalNumber(): string {
    return this.nationalNumber;
  }

  public getFormattedNumber(): string {
    // Format as +XX XXX XXX XXXX (example)
    if (this.nationalNumber.length === 10) {
      return `${this.countryCode} ${this.nationalNumber.slice(0, 3)} ${this.nationalNumber.slice(3, 6)} ${this.nationalNumber.slice(6)}`;
    }
    return this.value;
  }

  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters except + at the beginning
    return phone.replace(/[^\d+]/g, '').trim();
  }

  private isValid(phone: string): boolean {
    // Must start with + for international or be at least 10 digits for local
    if (phone.startsWith('+')) {
      // International format: +[1-4 digits country code][6-15 digits]
      const internationalRegex = /^\+\d{1,4}\d{6,15}$/;
      return (
        internationalRegex.test(phone) &&
        phone.length >= 8 &&
        phone.length <= 20
      );
    } else {
      // Local format: at least 10 digits
      const localRegex = /^\d{10,15}$/;
      return localRegex.test(phone);
    }
  }

  private parsePhoneNumber(phone: string): {
    fullNumber: string;
    countryCode: string;
    nationalNumber: string;
  } {
    if (phone.startsWith('+')) {
      // International format
      const withoutPlus = phone.slice(1);

      // Common country codes (1-4 digits)
      let countryCode = '';
      let nationalNumber = '';

      // Try to extract country code (simplified logic)
      if (withoutPlus.startsWith('1') && withoutPlus.length === 11) {
        // North America (+1)
        countryCode = '+1';
        nationalNumber = withoutPlus.slice(1);
      } else if (withoutPlus.length >= 10) {
        // Default: assume 2-digit country code for others
        const possibleCountryCode = withoutPlus.slice(0, 2);
        countryCode = '+' + possibleCountryCode;
        nationalNumber = withoutPlus.slice(2);
      } else {
        countryCode = '+' + withoutPlus.slice(0, 1);
        nationalNumber = withoutPlus.slice(1);
      }

      return {
        fullNumber: phone,
        countryCode,
        nationalNumber,
      };
    } else {
      // Local format - assume default country (+1 for example)
      return {
        fullNumber: '+1' + phone,
        countryCode: '+1',
        nationalNumber: phone,
      };
    }
  }

  public equals(other: Phone): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static create(phone: string): Phone {
    return new Phone(phone);
  }
}

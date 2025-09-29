export class Address {
  private readonly value: string;
  private readonly street: string;
  private readonly city: string;
  private readonly region: string;
  private readonly country: string;

  constructor(address: string) {
    const trimmedAddress = address.trim();
    if (!this.isValid(trimmedAddress)) {
      throw new Error(
        'Address must be at least 5 characters long and not exceed 500 characters',
      );
    }

    this.value = trimmedAddress;
    const parsed = this.parseAddress(trimmedAddress);
    this.street = parsed.street;
    this.city = parsed.city;
    this.region = parsed.region;
    this.country = parsed.country;
  }

  public getValue(): string {
    return this.value;
  }

  public getStreet(): string {
    return this.street;
  }

  public getCity(): string {
    return this.city;
  }

  public getRegion(): string {
    return this.region;
  }

  public getCountry(): string {
    return this.country;
  }

  public getFormattedAddress(): string {
    return this.value;
  }

  private isValid(address: string): boolean {
    // Must be between 5 and 500 characters
    if (address.length < 5 || address.length > 500) {
      return false;
    }

    // Must contain at least one letter and one number or be a well-formed address
    const hasLetterAndNumber = /(?=.*[a-zA-Z])(?=.*\d)/.test(address);
    const hasCommas = address.includes(',');
    const hasBasicStructure = /[a-zA-Z]/.test(address);

    return hasBasicStructure && (hasLetterAndNumber || hasCommas);
  }

  private parseAddress(address: string): {
    street: string;
    city: string;
    region: string;
    country: string;
  } {
    // Simple parsing - split by commas and trim
    const parts = address.split(',').map((part) => part.trim());

    let street = '';
    let city = '';
    let region = '';
    let country = '';

    if (parts.length >= 1) {
      street = parts[0];
    }
    if (parts.length >= 2) {
      city = parts[1];
    }
    if (parts.length >= 3) {
      region = parts[2];
    }
    if (parts.length >= 4) {
      country = parts[3];
    }

    return { street, city, region, country };
  }

  public equals(other: Address): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  public toString(): string {
    return this.value;
  }

  public getShortAddress(): string {
    // Return first part (usually street) + city if available
    const parts = this.value.split(',').map((part) => part.trim());
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return parts[0] || this.value;
  }

  public static create(address: string): Address {
    return new Address(address);
  }
}

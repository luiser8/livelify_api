export class Name {
  private readonly value: string;

  constructor(name: string) {
    const trimmedName = name.trim();
    if (!this.isValid(trimmedName)) {
      throw new Error(
        'Name must be at least 2 characters long and contain only letters, spaces, and common name characters',
      );
    }
    this.value = this.formatName(trimmedName);
  }

  public getValue(): string {
    return this.value;
  }

  private isValid(name: string): boolean {
    // At least 2 characters, only letters, spaces, hyphens, apostrophes, and dots
    const nameRegex =
      /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'.]{2,50}$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
  }

  private formatName(name: string): string {
    // Capitalize first letter of each word
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  public equals(other: Name): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public getInitials(): string {
    return this.value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }

  public getLength(): number {
    return this.value.length;
  }

  public static create(name: string): Name {
    return new Name(name);
  }
}

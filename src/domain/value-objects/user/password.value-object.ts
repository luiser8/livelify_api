import * as bcrypt from 'bcrypt';

export class Password {
  static create() {
    throw new Error('Method not implemented.');
  }
  private readonly value: string;

  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed && !this.isValid(password)) {
      throw new Error('Password must be at least 6 characters long');
    }
    this.value = password;
  }

  public getValue(): string {
    return this.value;
  }

  public async hash(): Promise<Password> {
    const saltRounds: number = 12;
    try {
      const hashedPassword: string = await bcrypt.hash(this.value, saltRounds);
      return new Password(hashedPassword, true);
    } catch {
      throw new Error('Failed to hash password');
    }
  }

  public async compare(plainPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, this.value);
    } catch {
      throw new Error('Failed to compare passwords');
    }
  }

  private isValid(password: string): boolean {
    // At least 6 characters
    return password.length >= 6;
  }

  public static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }
}

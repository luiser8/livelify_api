/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as bcrypt from 'bcrypt';

export class Password {
  private readonly value: string;

  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed && !this.isValid(password)) {
      throw new Error(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
      );
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
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  public static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }
}

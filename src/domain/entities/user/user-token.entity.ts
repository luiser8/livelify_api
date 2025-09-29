import { UserId } from '../../value-objects/user/user-id.value-object';

export class UserToken {
  private constructor(
    private readonly _id: string,
    private readonly _userId: UserId,
    private readonly _accessToken: string,
    private readonly _refreshToken: string | null,
    private readonly _expiresAt: Date,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  public getId(): string {
    return this._id;
  }

  public getUserId(): UserId {
    return this._userId;
  }

  public getAccessToken(): string {
    return this._accessToken;
  }

  public getRefreshToken(): string | null {
    return this._refreshToken;
  }

  public getExpiresAt(): Date {
    return this._expiresAt;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  public isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  public isValid(): boolean {
    return !this.isExpired() && this._accessToken.length > 0;
  }

  public static create(
    userId: UserId,
    accessToken: string,
    refreshToken: string | null,
    expiresAt: Date,
  ): UserToken {
    const now = new Date();
    const id = crypto.randomUUID();

    return new UserToken(
      id,
      userId,
      accessToken,
      refreshToken,
      expiresAt,
      now,
      now,
    );
  }

  public static fromPersistence(
    id: string,
    userId: UserId,
    accessToken: string,
    refreshToken: string | null,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date,
  ): UserToken {
    return new UserToken(
      id,
      userId,
      accessToken,
      refreshToken,
      expiresAt,
      createdAt,
      updatedAt,
    );
  }

  // Alias for fromPersistence (used by repository)
  public static reconstitute(
    id: string,
    userId: UserId,
    accessToken: string,
    refreshToken: string | null,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date,
  ): UserToken {
    return UserToken.fromPersistence(
      id,
      userId,
      accessToken,
      refreshToken,
      expiresAt,
      createdAt,
      updatedAt,
    );
  }

  public updateTokens(
    accessToken: string,
    refreshToken: string | null,
    expiresAt: Date,
  ): UserToken {
    return new UserToken(
      this._id,
      this._userId,
      accessToken,
      refreshToken,
      expiresAt,
      this._createdAt,
      new Date(), // Updated timestamp
    );
  }
}

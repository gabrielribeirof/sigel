import { AppError } from '../../shared/errors/app.error.js'
import { Identifier } from '../shared/identifier.js'

export type AuthTokenType = 'access' | 'refresh'

export type AuthTokenCreateProps = {
	userId: string | Identifier
	type: AuthTokenType
	tokenHash: string
	expiresAt: Date
}

export type AuthTokenReconstitutedProps = AuthTokenCreateProps & {
	id: string | Identifier
	revokedAt: Date | null
	createdAt: Date
}

export class AuthToken {
	private readonly _id: Identifier

	private readonly _userId: Identifier

	private readonly _type: AuthTokenType

	private readonly _tokenHash: string

	private readonly _expiresAt: Date

	private readonly _createdAt: Date

	private _revokedAt: Date | null

	private constructor(props: AuthTokenReconstitutedProps) {
		if (!props.tokenHash.trim()) throw new AppError('INVALID_PARAMETERS', 'Token hash is required')
		if (props.expiresAt <= props.createdAt) {
			throw new AppError('INVALID_PARAMETERS', 'Token expiration must be in the future')
		}
		this._id = Identifier.from(props.id)
		this._userId = Identifier.from(props.userId)
		this._type = props.type
		this._tokenHash = props.tokenHash
		this._expiresAt = props.expiresAt
		this._createdAt = props.createdAt
		this._revokedAt = props.revokedAt
	}

	public static create(props: AuthTokenCreateProps): AuthToken {
		const now = new Date()
		return new AuthToken({
			...props,
			id: Identifier.generate(),
			createdAt: now,
			revokedAt: null,
		})
	}

	public static reconstitute(props: AuthTokenReconstitutedProps): AuthToken {
		return new AuthToken(props)
	}

	public get id(): Identifier { return this._id }

	public get userId(): Identifier { return this._userId }

	public get type(): AuthTokenType { return this._type }

	public get tokenHash(): string { return this._tokenHash }

	public get expiresAt(): Date { return this._expiresAt }

	public get revokedAt(): Date | null { return this._revokedAt }

	public get createdAt(): Date { return this._createdAt }

	public isActive(now: Date = new Date()): boolean {
		return this._revokedAt === null && this._expiresAt > now
	}

	public revoke(at: Date = new Date()): void {
		if (this._revokedAt === null) this._revokedAt = at
	}
}

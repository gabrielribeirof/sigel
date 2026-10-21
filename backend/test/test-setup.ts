import { Identifier } from '../src/domain/shared/identifier.js'
import { Email } from '../src/domain/user/email.js'

const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

Identifier.configure({
	generate: () => '01900000-0000-7000-8000-000000000000',
	isValid: value => uuidV7Pattern.test(value),
})
Email.configure({ isValid: value => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) })

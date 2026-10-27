import { AppError } from '../errors/app.error.js'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function parseDateOnly(value: string): Date {
	if (!DATE_ONLY_PATTERN.test(value)) {
		throw invalidDate()
	}

	const [year, month, day] = value.split('-').map(Number)
	const date = new Date(Date.UTC(year, month - 1, day))
	if (
		date.getUTCFullYear() !== year
		|| date.getUTCMonth() !== month - 1
		|| date.getUTCDate() !== day
	) {
		throw invalidDate()
	}
	return date
}

export function formatDateOnly(value: Date): string {
	if (Number.isNaN(value.getTime())) throw invalidDate()
	return [
		value.getUTCFullYear().toString().padStart(4, '0'),
		(value.getUTCMonth() + 1).toString().padStart(2, '0'),
		value.getUTCDate().toString().padStart(2, '0'),
	].join('-')
}

function invalidDate(): AppError {
	return new AppError('INVALID_PARAMETERS', 'Informe uma data válida no formato YYYY-MM-DD.')
}

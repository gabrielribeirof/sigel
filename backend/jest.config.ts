import type { Config } from 'jest'

const config: Config = {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/*.spec.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			tsconfig: '<rootDir>/tsconfig.test.json',
			useESM: true,
		}],
	},
	collectCoverageFrom: [
		'src/domain/**/*.ts',
		'src/services/**/*.ts',
		'src/controllers/**/*.ts',
		'src/shared/**/*.ts',
		'src/infrastructure/http/**/*.ts',
		'src/infrastructure/security/**/*.ts',
		'!src/config/**/*.ts',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	reporters: [
		'default',
		['jest-html-reporter', {
			pageTitle: 'SIGEL backend test report',
			outputPath: 'coverage/test-report.html',
			includeFailureMsg: true,
			includeConsoleLog: true,
		}],
	],
	clearMocks: true,
	setupFiles: ['<rootDir>/test/test-setup.ts'],
}

export default config

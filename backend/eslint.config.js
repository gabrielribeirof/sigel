// @ts-check

import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default defineConfig(
	globalIgnores(['dist/**', 'coverage/**']),
	{
	files: ['src/**/*.ts'],
	plugins: {
		'@stylistic': stylistic
	},
	extends: [js.configs.recommended, tseslint.configs.recommended, stylistic.configs.recommended],
	rules: {
		'@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
		'@stylistic/indent': ['error', 'tab'],
		'@stylistic/no-tabs': ['off'],
		'@stylistic/lines-between-class-members': ['error', 'always'],
		'@stylistic/object-curly-newline': [
			'error',
			{
				ObjectExpression: {
					minProperties: 2,
					multiline: true,
				},
				TSTypeLiteral: {
					minProperties: 2,
					multiline: true,
				},
			},
		],
		'@stylistic/object-property-newline': [
			'error',
			{
				allowAllPropertiesOnSameLine: false,
			},
		],
		'@stylistic/max-len': ['error', { code: 120 }],
		curly: ['error', 'multi-line'],
		'no-restricted-syntax': [
			'error',
			{
				selector: 'PropertyDefinition[value.type=\'ArrowFunctionExpression\']',
				message: 'Do not use arrow functions as class properties. Use a method instead.',
			},
		],
	},
	languageOptions: {
		globals: {
			...globals.node,
			...globals.jest
		},
	},
	},
)

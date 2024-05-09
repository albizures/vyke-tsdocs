import antfu from '@antfu/eslint-config'

export default antfu({
	typescript: true,
	jsonc: true,
	stylistic: {
		indent: 'tab',
	},
}, {
	rules: {
		'ts/array-type': ['error', { default: 'generic', readonly: 'generic' }],
		'ts/consistent-type-definitions': ['error', 'type'],
		'ts/indent': 'off',
		'ts/no-redeclare': 'off',
		'arrow-parens': ['error', 'always'],
		'jsonc/indent': ['error', 'tab'],
		'style/indent': ['error', 'tab'],
		'curly': ['error', 'all'],
		'indent': 'off',
		'antfu/consistent-list-newline': 'off',
		// 'ts/consistent-type-imports': [
		// 	'error',
		// 	{
		// 		prefer: 'type-imports',
		// 		fixStyle: 'inline-type-imports',
		// 	},
		// ],
	},
})

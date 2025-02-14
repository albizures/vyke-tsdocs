import { expect, it } from 'vitest'
import { generateApi } from './generate'

it('test', () => {
	const apiDocs = generateApi({
		files: ['./playground/lib.ts'],
		root: './playground',
	})

	expect(apiDocs).toMatchInlineSnapshot(`
		"### second

		This is a function name second but goes first in the docs :)

		### nested

		This is a function is nested

		### first

		This is a function name first :)

		\`\`\`ts
		type Range = 1 | 2
		\`\`\`
		"
	`)
})

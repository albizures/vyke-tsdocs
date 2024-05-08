import { describe, expect, it } from 'vitest'
import { unwrap } from '@vyke/results'
import { replaceApiSection } from './readme'

function baseReadme(apiSection: string) {
	return `
# title

${apiSection}
## Inspiration and Credits
- foo

`
}
it('should replace the api section', () => {
	const apiSection = `## api\nsomething`
	const result = unwrap(
		replaceApiSection(
			baseReadme(apiSection),
			'api update',
		),
	)

	const expected = baseReadme('## api\napi update')

	expect(result).toBe(expected)

	const secondResult = unwrap(
		replaceApiSection(
			expected,
			'api update',
		),
	)

	expect(secondResult).toBe(expected)
})

describe('when no API section is found', () => {
	it('should return an error', () => {
		const apiSection = ''
		const result = replaceApiSection(
			baseReadme(apiSection),
			'api section',
		)

		expect(result.ok).toBe(false)
	})
})

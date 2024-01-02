import { r } from '@vyke/results'

// import { rootSola } from './sola'

// const sola = rootSola.withTag('readme')

export function replaceApiSection(readme: string, api: string) {
	const lines = readme.split('\n')

	let startAt = 0
	let endAt = lines.length - 1
	let level = 0
	let apiSectionFound = false

	for (const line of lines) {
		if (line.startsWith('#')) {
			const currentLevel = [...line.matchAll(/#/g)].length
			if (line.toUpperCase().includes('API')) {
				apiSectionFound = true
				level = currentLevel
				// adding a +1 to leave out the title
				startAt = lines.indexOf(line) + 1
			}
			if (level >= currentLevel) {
				endAt = lines.indexOf(line)
			}
		}
	}

	if (!apiSectionFound) {
		return r.err(new Error('API section not found'))
	}

	return r.ok([
		...lines.slice(0, startAt),
		api,
		...lines.slice(endAt),
	].join('\n'))
}

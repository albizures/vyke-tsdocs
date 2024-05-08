import { Err, Ok } from '@vyke/results'

// import { rootSola } from './sola'

// const sola = rootSola.withTag('readme')
/**
 * Replace the old api section with the given one
 */
export function replaceApiSection(readme: string, api: string) {
	const lines = readme.split('\n')

	let startAt = 0
	let endAt = lines.length - 1
	let level = 0
	let apiSectionFound = false

	for (const line of lines) {
		if (line.startsWith('#')) {
			const currentLevel = [...line.matchAll(/#/g)].length
			if (isApiSection(line)) {
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
		return Err(new Error('API section not found'))
	}

	return Ok([
		...lines.slice(0, startAt),
		api,
		...lines.slice(endAt),
	].join('\n'))
}
function isApiSection(line: string) {
	// we start with something like "### api"
	return line
		// the '#'s are remove, leaving only " api"
		.replaceAll(/#/g, '')
		// now everything with upper cases " API"
		.toUpperCase()
		// now trim it "API"
		.trim() === 'API'
}

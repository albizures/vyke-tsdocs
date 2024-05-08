import process from 'node:process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Err, Ok, to } from '@vyke/results'
import { rootSola } from './sola'

const root = process.cwd()
const readmePath = path.join(root, 'README.md')
const tsconfigPath = path.join(root, 'tsconfig.json')
const sola = rootSola.withTag('files')

export async function readTsConfig() {
	const readResult = await to(fs.readFile(tsconfigPath, 'utf-8'))

	if (!readResult.ok) {
		sola.error(readResult.value)
		return Err(new Error('unable to read tsconfig.json file'))
	}

	return parseJson(readResult.value)
}

function parseJson(raw: string) {
	try {
		return Ok(JSON.parse(raw))
	}
	catch (error) {
		sola.error(error)
		return Err(error)
	}
}

export async function readReadme() {
	const readResult = await to(fs.readFile(readmePath, 'utf-8'))

	if (!readResult.ok) {
		sola.error(readResult.value)
		return Err(new Error('unable to read README.md file'))
	}

	return readResult
}

export async function writeReadme(content: string) {
	const writeResult = await to(fs.writeFile(readmePath, content))

	if (!writeResult.ok) {
		sola.error(writeResult.value)
		return Err(new Error('unable to write README.md file'))
	}

	return writeResult
}

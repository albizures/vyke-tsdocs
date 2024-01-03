#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { r } from '@vyke/results'
import { rootSola } from '../sola'
import pkgJson from '../../package.json'
import { generateApi, replaceApiSection } from '../'
import { readReadme, writeReadme } from '../files'

const sola = rootSola.withTag('cli')

const main = defineCommand({
	meta: {
		name: 'tsdocs',
		version: pkgJson.version,
		description: 'tsdocs CLI by Vyke',
	},
	async run() {
		sola.log('Generating api docs...')
		const apiDocs = generateApi()

		const readme = await r.toUnwrap(readReadme())

		const readmeUpdate = r.unwrap(replaceApiSection(readme, apiDocs))

		sola.log('Writing api docs into readme...')
		await r.toUnwrap(writeReadme(readmeUpdate))

		sola.log('API docs updated!')
	},
})

runMain(main)

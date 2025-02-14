#!/usr/bin/env node
import { toUnwrap, unwrap } from '@vyke/results'
import { defineCommand, runMain } from 'citty'
import { generateApi, replaceApiSection } from '../'
import pkgJson from '../../package.json'
import { readReadme, writeReadme } from '../files'
import { rootSola } from '../sola'

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

		const readme = await toUnwrap(readReadme())

		const readmeUpdate = unwrap(replaceApiSection(readme, apiDocs))

		sola.log('Writing api docs into readme...')
		await toUnwrap(writeReadme(readmeUpdate))

		sola.log('API docs updated!')
	},
})

runMain(main)

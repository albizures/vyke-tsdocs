import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { rootSola } from './sola'

const sola = rootSola.withTag('main')

const fileName = './src/index.ts'

export type DocEntry = {
	name: string
	description: string
	signature?: string
	alias?: string
	examples: Array<string>
}

/**
 * Generates api docs base onda the jsdocs on the exports functions
 */
export function generateApi() {
	const root = process.cwd()

	const config = JSON.parse(fs.readFileSync(path.join(root, 'tsconfig.json'), 'utf-8'))

	const program = ts.createProgram(
		[fileName],
		config,
	)

	const checker = program.getTypeChecker()

	const entries: Array<DocEntry> = []

	for (const sourceFile of program.getSourceFiles()) {
		if (!sourceFile.isDeclarationFile) {
			sola.log('file ->', sourceFile.fileName)

			ts.forEachChild(sourceFile, visit)
		}
	}

	function visit(node: ts.Node) {
		// Only consider exported nodes
		if (!isNodeExported(node)) {
			return
		}

		if (ts.isClassDeclaration(node) && node.name) {
			// This is a top level class, get its symbol
			const symbol = checker.getSymbolAtLocation(node.name)
			if (symbol) {
				entries.push(serializeClass(symbol, checker))
			}
			// No need to walk any further, class expressions/inner declarations
			// cannot be exported
		}
		else if (ts.isFunctionDeclaration(node) && node.name) {
			const symbol = checker.getSymbolAtLocation(node.name)
			if (symbol) {
				entries.push(serializeSymbol(symbol, checker))
			}
		}
		ts.forEachChild(node, visit)
	}

	const docs = entries.map((entry) => {
		const { name, alias, description, examples } = entry

		if (description.trim() === '') {
			// skipping entries without a description
			return ''
		}

		return [
			`### ${name}`,
			description,
			alias
				? [
						'> [!TIP]',
						`> alias of \`${entry.alias}\``,
					].join('\n')
				: '',
			examples.join('\n\n'),
		].join('\n').trim()
	}).join('\n\n').trim()

	return `${docs}\n`
}

function isNodeExported(node: ts.Node): boolean {
	return (
		((ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0)
		&& (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
	)
}

function serializeSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): DocEntry {
	const tags = symbol.getJsDocTags(checker)
	const description = ts.displayPartsToString(symbol.getDocumentationComment(checker))
	const signature = checker.typeToString(
		checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!),
	)

	const entry: DocEntry = {
		name: symbol.getName(),
		description,
		signature,

		examples: [],

	}
	for (const tag of tags) {
		if (!tag.text) {
			continue
		}
		if (tag.name === 'alias') {
			entry.alias = ts.displayPartsToString(tag.text)
		}
		if (tag.name === 'example') {
			entry.examples.push(
				ts.displayPartsToString(tag.text),
			)
		}
	}
	return entry
}

function serializeClass(symbol: ts.Symbol, checker: ts.TypeChecker) {
	const entry = serializeSymbol(symbol, checker)

	// Get the construct signatures
	const constructorType = checker.getTypeOfSymbolAtLocation(
		symbol,
		symbol.valueDeclaration!,
	)

	const a = constructorType.getConstructSignatures().map((value) => {
		return checker.signatureToString(value)
	})

	sola.log(a)

	entry.signature = checker.typeToString(constructorType)

	return entry
}

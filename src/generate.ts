import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { rootSola } from './sola'

const sola = rootSola.withTag('main')

const defaultFiles = ['./src/index.ts']

export type DocEntry = {
	name: string
	description: string
	signature?: string
	alias?: string
	examples: Array<string>
	index: number
}

type GenerateApiArgs = {
	files: Array<string>
	root: string
}

/**
 * Generates api docs base on the jsdocs on the exports functions
 */
export function generateApi(args?: GenerateApiArgs) {
	const { files = defaultFiles, root = process.cwd() } = args ?? {}

	const config = JSON.parse(fs.readFileSync(path.join(root, 'tsconfig.json'), 'utf-8'))

	const program = ts.createProgram(
		files,
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
		else if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) && node.name) {
			const symbol = checker.getSymbolAtLocation(node.name)
			if (symbol) {
				entries.push(serializeSymbol(symbol, checker))
			}
		}
		ts.forEachChild(node, visit)
	}

	const docs = entries
		.sort((a, b) => a.index - b.index)
		.map((entry) => {
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
			].join('\n')
				.trim()
		})
	// removing items without documentation
		.filter(Boolean)
		.join('\n\n')
		.trim()

	return `${docs}\n`
}

function isNodeExported(node: ts.Node): boolean {
	if ((ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0) {
		if (node.parent) {
			if (node.parent.kind === ts.SyntaxKind.SourceFile) {
				return true
			}
		}
	}

	if (node.parent) {
		if (
			// if the parent is the first statement of a variable declaration list which has been exported
			(node.parent.kind === ts.SyntaxKind.FirstStatement || ts.isVariableDeclarationList(node.parent))
			&& isNodeExported(node.parent)) {
			return true
		}
	}

	return false
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
		index: Number.POSITIVE_INFINITY,
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

		if (tag.name === 'index') {
			const index = Number(ts.displayPartsToString(tag.text))
			entry.index = Number.isNaN(index) ? 0 : index
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

	entry.signature = checker.typeToString(constructorType)

	return entry
}

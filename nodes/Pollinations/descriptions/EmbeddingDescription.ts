import type { INodeProperties } from 'n8n-workflow';
import { modelLocator } from '../shared/CommonOptions';

const show = { resource: ['embedding'] };

export const embeddingDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create embeddings',
				description: 'Create vector embeddings from text input',
			},
		],
		default: 'create',
	},
	{
		...modelLocator({
			searchListMethod: 'getEmbeddingModels',
			defaultValue: 'openai/text-embedding-3-small',
			description:
				'Embedding model to use. The options are loaded live from the Pollinations model catalog.',
			idPlaceholder: 'e.g. openai/text-embedding-3-small',
		}),
		displayOptions: { show: { ...show, operation: ['create'] } },
	},
	{
		displayName: 'Input',
		name: 'input',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['create'] } },
		description:
			'Text to embed. Use the "Batch Input" option to embed multiple strings in one request.',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['create'] } },
		options: [
			{
				displayName: 'Batch Input (JSON Array)',
				name: 'batchInput',
				type: 'json',
				default: '[]',
				description:
					'JSON array of strings to embed instead of a single input. Supports up to 32 items.',
			},
			{
				displayName: 'Dimensions',
				name: 'dimensions',
				type: 'number',
				default: 0,
				description: 'Number of dimensions of the output vector. 0 uses the model default.',
			},
			{
				displayName: 'Encoding Format',
				name: 'encodingFormat',
				type: 'options',
				default: 'float',
				description: 'Format of the returned embeddings',
				options: [
					{ name: 'Float', value: 'float', description: 'Array of floating point numbers' },
					{ name: 'Base64', value: 'base64', description: 'Base64 encoded string' },
				],
			},
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				default: 'none',
				description: 'Retrieval hint used by Cohere models. Leave as none for other providers.',
				options: [
					{ name: 'None', value: 'none', description: 'Do not send an input type' },
					{ name: 'Query', value: 'query', description: 'Search query' },
					{ name: 'Document', value: 'document', description: 'Document to be searched' },
				],
			},
		],
	},
];

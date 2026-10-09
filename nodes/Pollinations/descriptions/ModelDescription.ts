import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['model'] };

export const modelDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get Many',
				value: 'list',
				action: 'Get many models',
				description: 'List the available models with pricing and capabilities',
			},
		],
		default: 'list',
	},
	{
		displayName: 'Model Type',
		name: 'modelType',
		type: 'options',
		default: 'text',
		displayOptions: { show: { ...show, operation: ['list'] } },
		description: 'Category of models to list',
		options: [
			{ name: '3D', value: 'threeD', description: '3D generation models' },
			{ name: 'All', value: 'all', description: 'Every model across all categories' },
			{ name: 'Audio', value: 'audio', description: 'Audio models with supported voices' },
			{ name: 'Embedding', value: 'embedding', description: 'Embedding models' },
			{ name: 'Image', value: 'image', description: 'Image and video models' },
			{ name: 'OpenAI Compatible', value: 'openai', description: 'All models in OpenAI /v1/models format' },
			{ name: 'Text', value: 'text', description: 'Text / chat models' },
			{ name: 'Video', value: 'video', description: 'Video models' },
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['list'] } },
		options: [
			{
				displayName: 'Agent',
				name: 'agent',
				type: 'options',
				default: 'all',
				description: 'Filter for agent models',
				options: [
					{ name: 'All Models', value: 'all', description: 'Do not filter by agent' },
					{ name: 'Agents Only', value: 'only', description: 'Only return agents' },
					{ name: 'Exclude Agents', value: 'exclude' },
				],
			},
			{
				displayName: 'Capabilities',
				name: 'capabilities',
				type: 'multiOptions',
				default: [],
				description: 'Only return models that support all of the selected capabilities',
				options: [
					{ name: 'Code Execution', value: 'code_execution', description: 'Supports code execution' },
					{ name: 'Pollinations Models', value: 'pollinations_models', description: 'Can call Pollinations models' },
					{ name: 'Reasoning', value: 'reasoning', description: 'Supports reasoning effort' },
					{ name: 'Tool Calling', value: 'tool_calling', description: 'Supports function/tool calling' },
					{ name: 'Web Search', value: 'web_search', description: 'Supports web search' },
				],
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 500 },
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Case-insensitive search over name, aliases, title, description and publisher',
			},
			{
				displayName: 'Reliability',
				name: 'reliability',
				type: 'options',
				default: 'all',
				description: 'Whether to filter community models by recent reliability',
				options: [
					{ name: 'All Models', value: 'all', description: 'Include every accessible model' },
					{ name: 'Reliable Only', value: 'reliable', description: 'Only models above the reliability threshold' },
				],
			},
			{
				displayName: 'Return Each Model as Separate Item',
				name: 'splitIntoItems',
				type: 'boolean',
				default: true,
				description: 'Whether to output one n8n item per model instead of a single array item',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				default: 'all',
				description: 'Filter models by their publisher source',
				options: [
					{ name: 'All', value: 'all', description: 'Official and community models' },
					{ name: 'Official', value: 'official', description: 'Pollinations-operated models only' },
					{ name: 'Community', value: 'community', description: 'Community models only' },
				],
			},
		],
	},
];

import type { INodeProperties } from 'n8n-workflow';
import { safeOption } from '../shared/CommonOptions';

const show = { resource: ['text'] };

export const textDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Generate',
				value: 'generate',
				action: 'Generate text',
				description: 'Generate text with a chat completion model',
			},
		],
		default: 'generate',
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: 'openai',
		required: true,
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description:
			'Model ID to use. Aliases such as "openai" work, and full IDs such as "openai/gpt-5.4-nano" or "anthropic/claude-sonnet-4.6" are also accepted.',
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description: 'The user message to send to the model',
	},
	{
		displayName: 'System Prompt',
		name: 'systemPrompt',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description: 'Optional system message that sets the behaviour of the model',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['generate'] } },
		options: [
			{
				displayName: 'JSON Mode',
				name: 'jsonMode',
				type: 'boolean',
				default: false,
				description: 'Whether to force the model to return a valid JSON object',
			},
			{
				displayName: 'Max Tokens',
				name: 'maxTokens',
				type: 'number',
				default: 0,
				description: 'Maximum number of tokens to generate. 0 lets the model decide.',
			},
			{
				displayName: 'Private',
				name: 'private',
				type: 'boolean',
				default: false,
				description: 'Whether the request should be hidden from the public feed',
			},
			{
				displayName: 'Reasoning Effort',
				name: 'reasoningEffort',
				type: 'options',
				default: 'default',
				description: 'Reasoning effort for models that support reasoning',
				options: [
					{ name: 'Default', value: 'default', description: 'Use the model default' },
					{ name: 'Low', value: 'low', description: 'Minimal reasoning' },
					{ name: 'Medium', value: 'medium', description: 'Balanced reasoning' },
					{ name: 'High', value: 'high', description: 'Maximum reasoning' },
				],
			},
			{
				displayName: 'Safe',
				name: 'safe',
				type: 'multiOptions',
				default: [],
				description: safeOption.description,
				options: safeOption.options,
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: 0,
				description: 'Seed for deterministic sampling. 0 means random.',
			},
			{
				displayName: 'Simplify',
				name: 'simplify',
				type: 'boolean',
				default: true,
				description:
					'Whether to return only the generated text. Turn off to return the full API response.',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 2 },
				default: 0,
				description: 'Sampling temperature. 0 lets the model decide.',
			},
			{
				displayName: 'Top P',
				name: 'topP',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
				default: 0,
				description: 'Nucleus sampling value. 0 lets the model decide.',
			},
		],
	},
];

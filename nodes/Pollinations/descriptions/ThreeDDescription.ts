import type { INodeProperties } from 'n8n-workflow';
import { modelLocator, outputOption } from '../shared/CommonOptions';

const show = { resource: ['threeD'] };

export const threeDDescription: INodeProperties[] = [
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
				action: 'Generate a 3D model',
				description: 'Generate a GLB (or PLY) 3D model from a prompt and/or image',
			},
		],
		default: 'generate',
	},
	{
		...modelLocator({
			searchListMethod: 'getThreeDModels',
			defaultValue: 'microsoft/trellis-2',
			description:
				'3D model to use. The options are loaded live from the Pollinations model catalog. The Trellis 2 and Asset Harvester families only use the image.',
			idPlaceholder: 'e.g. microsoft/trellis-2',
		}),
		displayOptions: { show: { ...show, operation: ['generate'] } },
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description:
			'Text description of the 3D model. Ignored by the Trellis 2 and Asset Harvester families, which only use the image.',
	},
	{
		displayName: 'Image URL',
		name: 'image',
		type: 'string',
		default: '',
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description: 'Public URL of the source image, required by the Trellis 2 family',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['generate'] } },
		options: [
			outputOption,
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				default: 'low',
				description: 'Generation resolution for models that support it',
				options: [
					{ name: 'Low', value: 'low', description: 'Fastest, lowest quality' },
					{ name: 'Medium', value: 'medium', description: 'Balanced' },
					{ name: 'High', value: 'high', description: 'Slowest, highest quality' },
				],
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: 0,
				description: 'Seed for reproducible results. 0 means random.',
			},
		],
	},
];

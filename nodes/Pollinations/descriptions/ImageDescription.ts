import type { INodeProperties } from 'n8n-workflow';
import { outputOption, safeOption } from '../shared/CommonOptions';

const show = { resource: ['image'] };

export const imageDescription: INodeProperties[] = [
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
				action: 'Generate an image',
				description: 'Generate an image from a text prompt',
			},
		],
		default: 'generate',
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: 'flux',
		required: true,
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description:
			'Image model to use, for example "flux", "flux-realism", "turbo" or a full ID such as "black-forest-labs/flux.1-schnell"',
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description: 'Text description of the image to generate',
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
				displayName: 'Enhance',
				name: 'enhance',
				type: 'boolean',
				default: false,
				description: 'Whether to let the model improve the prompt before generating',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 1024,
				description: 'Image height in pixels',
			},
			{
				displayName: 'Image URL',
				name: 'image',
				type: 'string',
				default: '',
				description:
					'Source image URL, used by edit-capable models to transform an existing image',
			},
			{
				displayName: 'No Logo',
				name: 'nologo',
				type: 'boolean',
				default: false,
				description: 'Whether to remove the Pollinations watermark',
			},
			{
				displayName: 'Private',
				name: 'private',
				type: 'boolean',
				default: false,
				description: 'Whether the request should be hidden from the public feed',
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
				description: 'Seed for reproducible images. 0 means random.',
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 1024,
				description: 'Image width in pixels',
			},
		],
	},
];

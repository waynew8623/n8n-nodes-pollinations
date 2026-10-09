import type { INodeProperties } from 'n8n-workflow';
import { outputOption, safeOption } from '../shared/CommonOptions';

const show = { resource: ['video'] };

export const videoDescription: INodeProperties[] = [
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
				action: 'Generate a video',
				description: 'Generate a video from a text prompt or a reference image',
			},
		],
		default: 'generate',
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: 'veo',
		required: true,
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description:
			'Video model to use, for example "veo" or a full ID such as "google/veo-3.1-fast"',
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['generate'] } },
		description: 'Text description of the video to generate',
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
				displayName: 'Aspect Ratio',
				name: 'aspectRatio',
				type: 'options',
				default: '16:9',
				description: 'Aspect ratio of the generated video',
				options: [
					{ name: '16:9 (Landscape)', value: '16:9', description: 'Widescreen landscape' },
					{ name: '9:16 (Portrait)', value: '9:16', description: 'Vertical portrait' },
					{ name: '1:1 (Square)', value: '1:1', description: 'Square' },
				],
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				default: 4,
				description: 'Duration of the generated video in seconds',
			},
			{
				displayName: 'Image URL',
				name: 'image',
				type: 'string',
				default: '',
				description: 'Public URL of an image to use as the first frame',
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
				description: 'Seed for reproducible videos. 0 means random.',
			},
		],
	},
];

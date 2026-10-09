import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['media'] };

export const mediaDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get Metadata',
				value: 'getMetadata',
				action: 'Get media metadata',
				description: 'Return the metadata of a stored file as JSON',
			},
			{
				name: 'List Gallery',
				value: 'list',
				action: 'List the public gallery',
				description: 'List the public gallery for a tag',
			},
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload a file',
				description: 'Upload an image, audio or video file and receive a media URL',
			},
		],
		default: 'upload',
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: { show: { ...show, operation: ['upload'] } },
		description: 'Name of the binary property that holds the file to upload',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['upload'] } },
		options: [
			{
				displayName: 'Custom ID',
				name: 'customId',
				type: 'string',
				default: '',
				description:
					'Optional custom ID for the file. Case-sensitive, up to 128 letters, digits, dots, underscores or hyphens.',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				description: 'File name to send with the upload',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description:
					'Comma-separated tags that publish the upload into each tag\'s public gallery',
			},
		],
	},
	{
		displayName: 'Media ID',
		name: 'mediaId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['getMetadata'] } },
		description: 'ID of the stored file, as returned by an upload',
	},
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['list'] } },
		description: 'Tag whose public gallery should be listed',
	},
];

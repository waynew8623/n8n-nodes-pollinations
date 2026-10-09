import type { INodeProperties } from 'n8n-workflow';

/** Reusable multi-select for the API `safe` filter. */
export const safeOption: INodeProperties = {
	displayName: 'Safe',
	name: 'safe',
	type: 'multiOptions',
	default: [],
	description: 'Optional safety checks applied to the text input before generation',
	options: [
		{ name: 'Privacy', value: 'privacy', description: 'Redact personal information' },
		{ name: 'Secrets', value: 'secrets', description: 'Redact keys and passwords' },
		{ name: 'Sexual', value: 'sexual', description: 'Block sexual content' },
		{ name: 'Shield', value: 'shield', description: 'Full shield filtering' },
		{ name: 'Violence', value: 'violence', description: 'Block violent content' },
	],
};

/** Reusable output selector for media resources that can return binary or a URL. */
export const outputOption: INodeProperties = {
	displayName: 'Output',
	name: 'output',
	type: 'options',
	default: 'binary',
	description: 'Whether to return the generated file as n8n binary data or only as a URL',
	options: [
		{ name: 'Binary File', value: 'binary', description: 'Return the generated file as binary data' },
		{ name: 'URL Only', value: 'url', description: 'Return only the generated file URL' },
	],
};

/** Reusable "private" toggle. */
export const privateOption: INodeProperties = {
	displayName: 'Private',
	name: 'private',
	type: 'boolean',
	default: false,
	description: 'Whether the request should be hidden from the public feed',
};

interface ModelLocatorConfig {
	searchListMethod: string;
	defaultValue: string;
	description: string;
	idPlaceholder?: string;
	paramName?: string;
}

/**
 * Reusable model picker. The list mode pulls the live catalog from the
 * Pollinations API so models never have to be typed by hand; the ID mode stays
 * available as an escape hatch for models the catalog does not expose.
 */
export function modelLocator(config: ModelLocatorConfig): INodeProperties {
	const { searchListMethod, defaultValue, description, idPlaceholder, paramName } = config;
	return {
		displayName: 'Model',
		name: paramName ?? 'model',
		type: 'resourceLocator',
		default: { mode: 'list', value: defaultValue },
		required: true,
		description,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Search a model...',
				typeOptions: {
					searchListMethod,
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: 'Model ID',
				name: 'id',
				type: 'string',
				placeholder: idPlaceholder ?? 'e.g. publisher/model-id',
			},
		],
	};
}

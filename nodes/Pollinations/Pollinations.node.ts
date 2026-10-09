import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { accountDescription } from './descriptions/AccountDescription';
import { audioDescription } from './descriptions/AudioDescription';
import { embeddingDescription } from './descriptions/EmbeddingDescription';
import { imageDescription } from './descriptions/ImageDescription';
import { mediaDescription } from './descriptions/MediaDescription';
import { modelDescription } from './descriptions/ModelDescription';
import { textDescription } from './descriptions/TextDescription';
import { threeDDescription } from './descriptions/ThreeDDescription';
import { videoDescription } from './descriptions/VideoDescription';
import {
	compact,
	extensionFromContentType,
	extractList,
	formatSafe,
	mediaUrlFromLinkHeader,
	numberOrUndefined,
	POLLINATIONS_BASE_URL,
	POLLINATIONS_MEDIA_URL,
	pollinationsApiRequest,
	pollinationsApiRequestBinary,
	pollinationsApiRequestFormData,
	pollinationsMediaRequest,
	type BinaryResponse,
} from './shared/GenericFunctions';

export class Pollinations implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pollinations',
		name: 'pollinations',
		icon: { light: 'file:../../icons/pollinations.svg', dark: 'file:../../icons/pollinations.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Generate text, images, video, audio, 3D models and embeddings with the Pollinations API',
		defaults: {
			name: 'Pollinations',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'pollinationsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: '3D', value: 'threeD' },
					{ name: 'Account', value: 'account' },
					{ name: 'Audio', value: 'audio' },
					{ name: 'Embedding', value: 'embedding' },
					{ name: 'Image', value: 'image' },
					{ name: 'Media', value: 'media' },
					{ name: 'Model', value: 'model' },
					{ name: 'Text', value: 'text' },
					{ name: 'Video', value: 'video' },
				],
				default: 'text',
			},
			...accountDescription,
			...audioDescription,
			...embeddingDescription,
			...imageDescription,
			...mediaDescription,
			...modelDescription,
			...textDescription,
			...threeDDescription,
			...videoDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let results: INodeExecutionData[];

				switch (resource) {
					case 'text':
						results = await executeText.call(this, i);
						break;
					case 'image':
						results = await executeImage.call(this, i);
						break;
					case 'video':
						results = await executeVideo.call(this, i);
						break;
					case 'threeD':
						results = await executeThreeD.call(this, i);
						break;
					case 'audio':
						results = await executeAudio.call(this, i, operation);
						break;
					case 'embedding':
						results = await executeEmbedding.call(this, i);
						break;
					case 'model':
						results = await executeModelList.call(this, i);
						break;
					case 'account':
						results = await executeAccount.call(this, i, operation);
						break;
					case 'media':
						results = await executeMedia.call(this, i, operation);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
							itemIndex: i,
						});
				}

				returnData.push(...results);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

/** Build a single binary output item from a raw API response. */
async function buildBinaryItem(
	this: IExecuteFunctions,
	response: BinaryResponse,
	fileNameBase: string,
	json: IDataObject,
): Promise<INodeExecutionData> {
	const contentType =
		(response.headers?.['content-type'] as string | undefined) ?? 'application/octet-stream';
	const extension = extensionFromContentType(contentType);
	const binary = await this.helpers.prepareBinaryData(
		response.body,
		`${fileNameBase}.${extension}`,
		contentType,
	);
	return { json, binary: { data: binary } };
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

async function executeText(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
	const model = this.getNodeParameter('model', itemIndex) as string;
	const prompt = this.getNodeParameter('prompt', itemIndex) as string;
	const systemPrompt = this.getNodeParameter('systemPrompt', itemIndex, '') as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	const messages: IDataObject[] = [];
	if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
	messages.push({ role: 'user', content: prompt });

	const body: IDataObject = { model, messages };

	const temperature = numberOrUndefined(options.temperature);
	if (temperature !== undefined) body.temperature = temperature;
	const topP = numberOrUndefined(options.topP);
	if (topP !== undefined) body.top_p = topP;
	const maxTokens = numberOrUndefined(options.maxTokens);
	if (maxTokens !== undefined) body.max_tokens = maxTokens;
	const seed = numberOrUndefined(options.seed);
	if (seed !== undefined) body.seed = seed;
	if (options.jsonMode === true) body.response_format = { type: 'json_object' };
	if (options.private === true) body.private = true;
	if (typeof options.reasoningEffort === 'string' && options.reasoningEffort !== 'default') {
		body.reasoning_effort = options.reasoningEffort;
	}
	const safe = formatSafe(options.safe);
	if (safe) body.safe = safe;

	const response = await pollinationsApiRequest.call(this, 'POST', '/v1/chat/completions', {}, body);

	if (options.simplify === false) {
		return [{ json: response, pairedItem: { item: itemIndex } }];
	}

	const choices = (response.choices as IDataObject[] | undefined) ?? [];
	const message = (choices[0]?.message as IDataObject | undefined) ?? {};
	return [
		{
			json: { text: (message.content as string | undefined) ?? '' },
			pairedItem: { item: itemIndex },
		},
	];
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

async function executeImage(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
	const model = this.getNodeParameter('model', itemIndex) as string;
	const prompt = this.getNodeParameter('prompt', itemIndex) as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
	const output = (options.output as string | undefined) ?? 'binary';

	const url = `${POLLINATIONS_BASE_URL}/image/${encodeURIComponent(prompt)}`;
	const qs = compact({
		model,
		width: numberOrUndefined(options.width),
		height: numberOrUndefined(options.height),
		seed: numberOrUndefined(options.seed),
		image: options.image as string,
		nologo: options.nologo === true ? 'true' : undefined,
		enhance: options.enhance === true ? 'true' : undefined,
		private: options.private === true ? 'true' : undefined,
		safe: formatSafe(options.safe),
	});

	if (output === 'url') {
		return [{ json: { url, prompt, model }, pairedItem: { item: itemIndex } }];
	}

	const response = await pollinationsApiRequestBinary.call(this, 'GET', url, { qs });
	const mediaUrl = mediaUrlFromLinkHeader(response.headers?.link as string | undefined);
	const item = await buildBinaryItem.call(this, response, 'image', {
		prompt,
		model,
		url: mediaUrl ?? url,
	});
	item.pairedItem = { item: itemIndex };
	return [item];
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

async function executeVideo(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
	const model = this.getNodeParameter('model', itemIndex) as string;
	const prompt = this.getNodeParameter('prompt', itemIndex) as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
	const output = (options.output as string | undefined) ?? 'binary';

	const url = `${POLLINATIONS_BASE_URL}/video/${encodeURIComponent(prompt)}`;
	const qs = compact({
		model,
		duration: numberOrUndefined(options.duration),
		aspectRatio: options.aspectRatio as string,
		seed: numberOrUndefined(options.seed),
		image: options.image as string,
		private: options.private === true ? 'true' : undefined,
		safe: formatSafe(options.safe),
	});

	if (output === 'url') {
		return [{ json: { url, prompt, model }, pairedItem: { item: itemIndex } }];
	}

	const response = await pollinationsApiRequestBinary.call(this, 'GET', url, { qs });
	const mediaUrl = mediaUrlFromLinkHeader(response.headers?.link as string | undefined);
	const item = await buildBinaryItem.call(this, response, 'video', {
		prompt,
		model,
		url: mediaUrl ?? url,
	});
	item.pairedItem = { item: itemIndex };
	return [item];
}

// ---------------------------------------------------------------------------
// 3D
// ---------------------------------------------------------------------------

async function executeThreeD(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
	const model = this.getNodeParameter('model', itemIndex) as string;
	const prompt = this.getNodeParameter('prompt', itemIndex, '') as string;
	const image = this.getNodeParameter('image', itemIndex, '') as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
	const output = (options.output as string | undefined) ?? 'binary';

	const url = `${POLLINATIONS_BASE_URL}/3d/${encodeURIComponent(prompt || 'no_prompt')}`;
	const qs = compact({
		model,
		image,
		resolution: options.resolution as string,
		seed: numberOrUndefined(options.seed),
	});

	if (output === 'url') {
		return [{ json: { url, prompt, image, model }, pairedItem: { item: itemIndex } }];
	}

	const response = await pollinationsApiRequestBinary.call(this, 'GET', url, { qs });
	const mediaUrl = mediaUrlFromLinkHeader(response.headers?.link as string | undefined);
	const item = await buildBinaryItem.call(this, response, 'model', {
		prompt,
		image,
		model,
		url: mediaUrl ?? url,
	});
	item.pairedItem = { item: itemIndex };
	return [item];
}

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

async function executeAudio(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	if (operation === 'transcribe') {
		return await transcribeAudio.call(this, itemIndex);
	}
	return await generateSpeech.call(this, itemIndex);
}

async function generateSpeech(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const text = this.getNodeParameter('text', itemIndex) as string;
	const model = this.getNodeParameter('audioModel', itemIndex, '') as string;
	const voice = this.getNodeParameter('voice', itemIndex) as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	const body = compact({
		model,
		input: text,
		voice,
		response_format: options.responseFormat as string,
	});

	const response = await pollinationsApiRequestBinary.call(
		this,
		'POST',
		`${POLLINATIONS_BASE_URL}/v1/audio/speech`,
		{ body },
	);

	const item = await buildBinaryItem.call(this, response, 'speech', { text, voice, model });
	item.pairedItem = { item: itemIndex };
	return [item];
}

async function transcribeAudio(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const inputType = this.getNodeParameter('inputType', itemIndex, 'binary') as string;
	const model = this.getNodeParameter('transcribeModel', itemIndex, '') as string;
	const options = this.getNodeParameter('transcribeOptions', itemIndex, {}) as IDataObject;

	let buffer: Buffer;
	let fileName = 'audio.mp3';
	let contentType = 'application/octet-stream';

	if (inputType === 'url') {
		const audioUrl = this.getNodeParameter('audioUrl', itemIndex) as string;
		const downloaded = (await this.helpers.httpRequest({
			method: 'GET',
			url: audioUrl,
			encoding: 'arraybuffer',
			returnFullResponse: true,
		})) as unknown as BinaryResponse;
		buffer = downloaded.body;
		contentType = (downloaded.headers?.['content-type'] as string | undefined) ?? contentType;
		fileName = audioUrl.split('?')[0].split('/').pop() || fileName;
	} else {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
		const meta = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
		fileName = meta.fileName ?? fileName;
		contentType = meta.mimeType ?? contentType;
	}

	const formData: IDataObject = {
		file: { value: buffer, options: { filename: fileName, contentType } },
	};
	if (model) formData.model = model;
	if (options.language) formData.language = options.language;

	const response = await pollinationsApiRequestFormData.call(
		this,
		`${POLLINATIONS_BASE_URL}/v1/audio/transcriptions`,
		formData,
	);

	return [{ json: response, pairedItem: { item: itemIndex } }];
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

async function executeEmbedding(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const model = this.getNodeParameter('model', itemIndex) as string;
	const input = this.getNodeParameter('input', itemIndex) as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	let inputValue: string | string[] = input;
	const batchRaw = options.batchInput;
	if (typeof batchRaw === 'string' && batchRaw.trim() !== '' && batchRaw.trim() !== '[]') {
		const parsed = JSON.parse(batchRaw) as unknown;
		if (!Array.isArray(parsed)) {
			throw new NodeOperationError(this.getNode(), 'Batch Input must be a JSON array of strings', {
				itemIndex,
			});
		}
		inputValue = parsed as string[];
	}

	const body: IDataObject = { model, input: inputValue };
	const dimensions = numberOrUndefined(options.dimensions);
	if (dimensions !== undefined) body.dimensions = dimensions;
	if (typeof options.encodingFormat === 'string' && options.encodingFormat !== '') {
		body.encoding_format = options.encodingFormat;
	}
	if (typeof options.inputType === 'string' && options.inputType !== 'none') {
		body.input_type = options.inputType;
	}

	const response = await pollinationsApiRequest.call(this, 'POST', '/v1/embeddings', {}, body);
	return [{ json: response, pairedItem: { item: itemIndex } }];
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

async function executeModelList(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const modelType = this.getNodeParameter('modelType', itemIndex, 'text') as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	const paths: Record<string, string> = {
		all: '/models',
		text: '/text/models',
		image: '/image/models',
		video: '/video/models',
		audio: '/audio/models',
		embedding: '/embeddings/models',
		threeD: '/3d/models',
		openai: '/v1/models',
	};
	const path = paths[modelType] ?? '/models';

	const capabilities = Array.isArray(options.capabilities)
		? (options.capabilities as string[]).join(',')
		: undefined;

	let agentParam: string | undefined;
	if (options.agent === 'only') agentParam = 'true';
	else if (options.agent === 'exclude') agentParam = 'false';

	const qs = compact({
		query: options.query as string,
		capabilities,
		agent: agentParam,
		limit: numberOrUndefined(options.limit),
		source: options.source === 'all' ? undefined : (options.source as string),
		reliability: options.reliability === 'reliable' ? 'reliable' : undefined,
	});

	const response = await pollinationsApiRequest.call(this, 'GET', path, qs);

	if (options.splitIntoItems === false) {
		return [{ json: response, pairedItem: { item: itemIndex } }];
	}

	const list = extractList(response);
	if (list.length === 0) {
		return [{ json: response, pairedItem: { item: itemIndex } }];
	}
	return list.map((entry) => ({ json: entry, pairedItem: { item: itemIndex } }));
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

async function executeAccount(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const paths: Record<string, string> = {
		getBalance: '/account/balance',
		getProfile: '/account/profile',
		getUsage: '/account/usage',
		getUsageDaily: '/account/usage/daily',
		getKey: '/account/key',
	};
	const path = paths[operation] ?? '/account/balance';
	const response = await pollinationsApiRequest.call(this, 'GET', path);
	return [{ json: response, pairedItem: { item: itemIndex } }];
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

async function executeMedia(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	if (operation === 'upload') {
		return await uploadMedia.call(this, itemIndex);
	}

	if (operation === 'getMetadata') {
		const mediaId = this.getNodeParameter('mediaId', itemIndex) as string;
		const response = await pollinationsMediaRequest.call(this, 'GET', `/${mediaId}/metadata`);
		return [{ json: response, pairedItem: { item: itemIndex } }];
	}

	const tag = this.getNodeParameter('tag', itemIndex) as string;
	const response = await pollinationsMediaRequest.call(this, 'GET', '/media', { tag });
	return [{ json: response, pairedItem: { item: itemIndex } }];
}

async function uploadMedia(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	const meta = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	const fileName = (options.fileName as string | undefined) || meta.fileName || 'file';
	const contentType = meta.mimeType || 'application/octet-stream';

	const formData: IDataObject = {
		file: { value: buffer, options: { filename: fileName, contentType } },
	};
	if (options.customId) formData.id = options.customId;
	if (options.tags) formData.tags = options.tags;

	const response = await pollinationsApiRequestFormData.call(
		this,
		`${POLLINATIONS_MEDIA_URL}/upload`,
		formData,
	);
	return [{ json: response, pairedItem: { item: itemIndex } }];
}

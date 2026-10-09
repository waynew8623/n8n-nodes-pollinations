import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

export const POLLINATIONS_BASE_URL = 'https://gen.pollinations.ai';
export const POLLINATIONS_MEDIA_URL = 'https://media.pollinations.ai';

export interface BinaryResponse {
	body: Buffer;
	headers: IDataObject;
	statusCode?: number;
}

export interface BinaryRequestOptions {
	qs?: IDataObject;
	body?: IDataObject;
}

/**
 * Drop `undefined`, `null`, empty strings and empty arrays so we never send
 * meaningless query parameters to the API.
 */
export function compact(input: IDataObject): IDataObject {
	const output: IDataObject = {};
	for (const [key, value] of Object.entries(input)) {
		if (value === undefined || value === null || value === '') continue;
		if (Array.isArray(value) && value.length === 0) continue;
		output[key] = value;
	}
	return output;
}

/** Return the value only when it is a meaningful (non-zero, non-NaN) number. */
export function numberOrUndefined(value: unknown): number | undefined {
	if (typeof value === 'number' && !Number.isNaN(value) && value !== 0) return value;
	return undefined;
}

/**
 * Build the `safe` value expected by the API from the multi-select input.
 * Returns undefined when nothing is selected.
 */
export function formatSafe(safe: unknown): string | undefined {
	if (!Array.isArray(safe) || safe.length === 0) return undefined;
	return safe.join(',');
}

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/svg+xml': 'svg',
	'video/mp4': 'mp4',
	'video/webm': 'webm',
	'video/quicktime': 'mov',
	'audio/mpeg': 'mp3',
	'audio/mp3': 'mp3',
	'audio/wav': 'wav',
	'audio/x-wav': 'wav',
	'audio/ogg': 'ogg',
	'audio/opus': 'opus',
	'audio/aac': 'aac',
	'audio/flac': 'flac',
	'model/gltf-binary': 'glb',
	'model/gltf+json': 'gltf',
	'application/octet-stream': 'glb',
};

/** Map a response content type to a sensible file extension. */
export function extensionFromContentType(contentType?: string): string {
	if (!contentType) return 'bin';
	const normalized = contentType.split(';')[0].trim().toLowerCase();
	return CONTENT_TYPE_EXTENSIONS[normalized] ?? 'bin';
}

/** Extract a media.pollinations.ai URL from a `Link: <url>; rel="enclosure"` header. */
export function mediaUrlFromLinkHeader(link?: string): string | undefined {
	if (!link) return undefined;
	const match = link.match(/<([^>]+)>/);
	return match ? match[1] : undefined;
}

/** Normalize a model list response (`[...]` or `{ data: [...] }`) into an array. */
export function extractList(response: unknown): IDataObject[] {
	if (Array.isArray(response)) return response as IDataObject[];
	if (response && typeof response === 'object' && Array.isArray((response as IDataObject).data)) {
		return (response as IDataObject).data as IDataObject[];
	}
	return [];
}

/**
 * Perform a JSON request against the Pollinations API using the stored credential.
 */
export async function pollinationsApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	qs: IDataObject = {},
	body?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${POLLINATIONS_BASE_URL}${path}`,
		json: true,
	};

	const filteredQs = compact(qs);
	if (Object.keys(filteredQs).length > 0) options.qs = filteredQs;
	if (body !== undefined) options.body = body;

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'pollinationsApi',
		options,
	)) as IDataObject;
}

/**
 * Perform a JSON request against the Pollinations media host
 * (media.pollinations.ai) using the stored credential.
 */
export async function pollinationsMediaRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	qs: IDataObject = {},
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${POLLINATIONS_MEDIA_URL}${path}`,
		json: true,
	};

	const filteredQs = compact(qs);
	if (Object.keys(filteredQs).length > 0) options.qs = filteredQs;

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'pollinationsApi',
		options,
	)) as IDataObject;
}

/**
 * Perform a request that returns raw bytes (image, video, audio, 3D model).
 * Uses `arraybuffer` so the binary payload survives untouched and keeps the
 * response headers (Content-Type, Link) available to the caller.
 */
export async function pollinationsApiRequestBinary(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	url: string,
	options: BinaryRequestOptions = {},
): Promise<BinaryResponse> {
	const requestOptions: IHttpRequestOptions = {
		method,
		url,
		encoding: 'arraybuffer',
		returnFullResponse: true,
	};

	if (options.qs) {
		const filteredQs = compact(options.qs);
		if (Object.keys(filteredQs).length > 0) requestOptions.qs = filteredQs;
	}

	if (options.body !== undefined) {
		requestOptions.body = JSON.stringify(options.body);
		requestOptions.json = false;
		requestOptions.headers = { 'Content-Type': 'application/json' };
	}

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'pollinationsApi',
		requestOptions,
	)) as unknown as BinaryResponse;
}

/**
 * Build a multipart/form-data payload without pulling in an extra dependency.
 * File parts are given as `{ value: Buffer, options: { filename, contentType } }`.
 */
export function buildMultipartBody(formData: IDataObject): { body: Buffer; contentType: string } {
	const boundary = `----n8nPollinationsBoundary${Date.now().toString(16)}${Math.random()
		.toString(16)
		.slice(2)}`;
	const chunks: Buffer[] = [];
	const crlf = '\r\n';

	for (const [name, raw] of Object.entries(formData)) {
		if (raw === undefined || raw === null) continue;

		const isFile =
			typeof raw === 'object' && raw !== null && !Array.isArray(raw) && 'value' in raw;

		if (isFile) {
			const file = raw as {
				value: Buffer;
				options?: { filename?: string; contentType?: string };
			};
			const filename = file.options?.filename ?? 'file';
			const fileContentType = file.options?.contentType ?? 'application/octet-stream';
			chunks.push(
				Buffer.from(
					`--${boundary}${crlf}Content-Disposition: form-data; name="${name}"; filename="${filename}"${crlf}Content-Type: ${fileContentType}${crlf}${crlf}`,
					'utf8',
				),
				Buffer.isBuffer(file.value) ? file.value : Buffer.from(String(file.value), 'utf8'),
				Buffer.from(crlf, 'utf8'),
			);
		} else {
			chunks.push(
				Buffer.from(
					`--${boundary}${crlf}Content-Disposition: form-data; name="${name}"${crlf}${crlf}`,
					'utf8',
				),
				Buffer.from(String(raw), 'utf8'),
				Buffer.from(crlf, 'utf8'),
			);
		}
	}

	chunks.push(Buffer.from(`--${boundary}--${crlf}`, 'utf8'));
	return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

/**
 * Perform a multipart/form-data request (audio transcription, media upload).
 */
export async function pollinationsApiRequestFormData(
	this: IExecuteFunctions,
	url: string,
	formData: IDataObject,
	qs: IDataObject = {},
): Promise<IDataObject> {
	const { body, contentType } = buildMultipartBody(formData);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url,
		body,
		headers: { 'Content-Type': contentType },
		json: true,
	};

	const filteredQs = compact(qs);
	if (Object.keys(filteredQs).length > 0) options.qs = filteredQs;

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'pollinationsApi',
		options,
	)) as IDataObject;
}

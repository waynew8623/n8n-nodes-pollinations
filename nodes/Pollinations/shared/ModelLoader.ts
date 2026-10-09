import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

const BASE_URL = 'https://gen.pollinations.ai';
const CACHE_TTL_MS = 5 * 60 * 1000;
const PAGE_SIZE = 100;

type ModelCategory = 'text' | 'image' | 'video' | 'audio' | 'embedding' | '3d';

const cache = new Map<string, { fetchedAt: number; models: IDataObject[] }>();

function modelsEndpoint(category: ModelCategory): string {
	return category === 'embedding' ? '/embeddings/models' : `/${category}/models`;
}

/** Fetch (and briefly cache) the model catalog for a category. */
async function fetchModels(
	this: ILoadOptionsFunctions,
	category: ModelCategory,
): Promise<IDataObject[]> {
	const now = Date.now();
	const cached = cache.get(category);
	if (cached && now - cached.fetchedAt < CACHE_TTL_MS) return cached.models;

	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'pollinationsApi', {
		method: 'GET',
		url: `${BASE_URL}${modelsEndpoint(category)}`,
		json: true,
	})) as unknown;

	const models = Array.isArray(response)
		? (response as IDataObject[])
		: (((response as IDataObject | null)?.data as IDataObject[] | undefined) ?? []);

	cache.set(category, { fetchedAt: now, models });
	return models;
}

function toStringArray(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function matchesQuery(model: IDataObject, query: string): boolean {
	const haystack = [
		model.name,
		model.title,
		model.publisher,
		model.description,
		...toStringArray(model.aliases),
	]
		.filter((value): value is string => typeof value === 'string')
		.join(' ')
		.toLowerCase();
	return haystack.includes(query);
}

function toSearchItem(model: IDataObject): INodeListSearchItems {
	const id = String(model.name ?? '');
	const title = typeof model.title === 'string' && model.title !== '' ? model.title : id;
	const suffix = model.community === true ? ' · community' : '';
	return {
		name: title === id ? id : `${title} (${id})${suffix}`,
		value: id,
		description: typeof model.description === 'string' ? model.description : undefined,
	};
}

async function searchModels(
	this: ILoadOptionsFunctions,
	category: ModelCategory,
	filter?: string,
	paginationToken?: string,
	supportedEndpoints?: string[],
): Promise<INodeListSearchResult> {
	let models = await fetchModels.call(this, category);

	if (supportedEndpoints && supportedEndpoints.length > 0) {
		models = models.filter((model) => {
			const endpoints = toStringArray(model.supported_endpoints);
			return supportedEndpoints.some((endpoint) => endpoints.includes(endpoint));
		});
	}

	const query = (filter ?? '').trim().toLowerCase();
	if (query !== '') {
		models = models.filter((model) => matchesQuery(model, query));
	}

	const page = paginationToken ? Number(paginationToken) : 1;
	const start = (page - 1) * PAGE_SIZE;
	const pageItems = models.slice(start, start + PAGE_SIZE);

	return {
		results: pageItems.map(toSearchItem),
		paginationToken: start + PAGE_SIZE < models.length ? String(page + 1) : undefined,
	};
}

export async function getTextModels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchModels.call(this, 'text', filter, paginationToken);
}

export async function getImageModels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchModels.call(this, 'image', filter, paginationToken);
}

export async function getVideoModels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchModels.call(this, 'video', filter, paginationToken);
}

/** Text-to-speech models (those exposing POST /v1/audio/speech). */
export async function getAudioModels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchModels.call(this, 'audio', filter, paginationToken, ['/v1/audio/speech']);
}

/** Speech-to-text models (those exposing POST /v1/audio/transcriptions). */
export async function getTranscriptionModels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchModels.call(this, 'audio', filter, paginationToken, ['/v1/audio/transcriptions']);
}

export async function getThreeDModels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchModels.call(this, '3d', filter, paginationToken);
}

export async function getEmbeddingModels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchModels.call(this, 'embedding', filter, paginationToken);
}

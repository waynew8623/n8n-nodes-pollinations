import type { INodeProperties } from 'n8n-workflow';
import { modelLocator } from '../shared/CommonOptions';

const show = { resource: ['audio'] };

const VOICES = [
	'alloy',
	'echo',
	'fable',
	'onyx',
	'nova',
	'shimmer',
	'ash',
	'ballad',
	'coral',
	'sage',
	'verse',
	'rachel',
	'domi',
	'bella',
	'elli',
	'charlotte',
	'dorothy',
	'sarah',
	'emily',
	'lily',
	'matilda',
	'adam',
	'antoni',
	'arnold',
	'josh',
	'sam',
	'daniel',
	'charlie',
	'james',
	'fin',
	'callum',
	'liam',
	'george',
	'brian',
	'bill',
];

export const audioDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Speech',
				value: 'speech',
				action: 'Generate speech',
				description: 'Convert text to speech (text-to-speech)',
			},
			{
				name: 'Transcribe',
				value: 'transcribe',
				action: 'Transcribe audio',
				description: 'Convert speech to text (speech-to-text)',
			},
		],
		default: 'speech',
	},

	// ---- Speech (text to speech) ----
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['speech'] } },
		description: 'Text to convert to speech',
	},
	{
		...modelLocator({
			paramName: 'audioModel',
			searchListMethod: 'getAudioModels',
			defaultValue: 'openai/tts-1',
			description:
				'Text-to-speech model to use. The options are loaded live from the Pollinations model catalog.',
			idPlaceholder: 'e.g. openai/tts-1',
		}),
		displayOptions: { show: { ...show, operation: ['speech'] } },
	},
	{
		displayName: 'Voice',
		name: 'voice',
		type: 'options',
		default: 'nova',
		displayOptions: { show: { ...show, operation: ['speech'] } },
		description: 'Voice to synthesise the speech with',
		options: VOICES.map((voice) => ({ name: voice, value: voice })),
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['speech'] } },
		options: [
			{
				displayName: 'Format',
				name: 'responseFormat',
				type: 'options',
				default: 'mp3',
				description: 'Audio container format of the generated file',
				options: [
					{ name: 'AAC', value: 'aac', description: 'Advanced Audio Coding' },
					{ name: 'FLAC', value: 'flac', description: 'Free lossless audio' },
					{ name: 'MP3', value: 'mp3', description: 'MPEG audio layer III' },
					{ name: 'Opus', value: 'opus', description: 'Opus in Ogg container' },
					{ name: 'PCM', value: 'pcm', description: 'Raw PCM audio' },
					{ name: 'WAV', value: 'wav', description: 'Uncompressed PCM audio' },
				],
			},
		],
	},

	// ---- Transcribe (speech to text) ----
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binary',
		displayOptions: { show: { ...show, operation: ['transcribe'] } },
		description: 'Where the audio to transcribe comes from',
		options: [
			{
				name: 'Binary File',
				value: 'binary',
				description: 'Use an audio file from a previous node in the workflow',
			},
			{ name: 'URL', value: 'url', description: 'Download the audio from a public URL first' },
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: { show: { ...show, operation: ['transcribe'], inputType: ['binary'] } },
		description: 'Name of the binary property that holds the audio file',
	},
	{
		displayName: 'Audio URL',
		name: 'audioUrl',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { ...show, operation: ['transcribe'], inputType: ['url'] } },
		description: 'Public HTTPS URL of the audio file to transcribe',
	},
	{
		...modelLocator({
			paramName: 'transcribeModel',
			searchListMethod: 'getTranscriptionModels',
			defaultValue: 'openai/whisper-large-v3',
			description:
				'Transcription model to use. The options are loaded live from the Pollinations model catalog.',
			idPlaceholder: 'e.g. openai/whisper-large-v3',
		}),
		displayOptions: { show: { ...show, operation: ['transcribe'] } },
	},
	{
		displayName: 'Options',
		name: 'transcribeOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['transcribe'] } },
		options: [
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				description: 'ISO-639-1 language code of the audio, for example "en" or "zh"',
			},
		],
	},
];

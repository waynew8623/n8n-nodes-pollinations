import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PollinationsApi implements ICredentialType {
	name = 'pollinationsApi';

	displayName = 'Pollinations API';

	icon: Icon = { light: 'file:../icons/pollinations.svg', dark: 'file:../icons/pollinations.dark.svg' };

	documentationUrl = 'https://gen.pollinations.ai/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'API key from enter.pollinations.ai/keys. Secret keys start with "sk_" and publishable keys with "pk_".',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://gen.pollinations.ai',
			url: '/account/key',
			method: 'GET',
		},
	};
}

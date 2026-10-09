import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['account'] };

export const accountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get Balance',
				value: 'getBalance',
				action: 'Get the pollen balance',
				description: 'Retrieve the remaining pollen balance of the account',
			},
			{
				name: 'Get Key Info',
				value: 'getKey',
				action: 'Get API key info',
				description: 'Return the validity, type and permissions of the calling API key',
			},
			{
				name: 'Get Profile',
				value: 'getProfile',
				action: 'Get the account profile',
				description: 'Return the GitHub username and community model access of the account',
			},
			{
				name: 'Get Usage',
				value: 'getUsage',
				action: 'Get usage history',
				description: 'Return per-request usage history with model, tokens, cost and response time',
			},
			{
				name: 'Get Usage (Daily)',
				value: 'getUsageDaily',
				action: 'Get daily usage',
				description: 'Return daily aggregated usage suitable for dashboards',
			},
		],
		default: 'getBalance',
	},
];

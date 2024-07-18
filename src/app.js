export default {
	id: 'request-and-format-api',
	name: 'Request and Format API',
	icon: 'webhook',
	description: 'Takes in JSON with variables, adds the variable values, makes API call using given URL, formats then returns the response',
	overview: ({ text }) => [
		{
			label: 'Text Asdasd',
			text: text,
		},
	],
	options: [
		{
			field: 'data',
			name: 'Data',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
};

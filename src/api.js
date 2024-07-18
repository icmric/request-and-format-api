export default {
	id: 'request-and-format-api',
	handler: async ({ }, context) => {
		let apiData = {
			"request": null,
		};
		if ((context.data.api_details[0].request == null || context.data.api_details[0].request == {}) == false) {
			apiData.request = recursiveReplace(context.data.api_details[0].request);
		}

		// Makes API call and saves raw response
		context.data.apiResponse = await performApiCall(context.data.api_details, apiData.request);
		let apiResponceObj;
		if (context.data.api_details[0].transform != null) {
			// Uses passes transform object to gather all data to return
			apiResponceObj = await recursiveReplace(context.data.api_details[0].transform);
		} else {
			// If no transform object is provided, the raw response is returned
			apiResponceObj = context.data.apiResponse;
		}
		
		return apiResponceObj;

		// Attempts to find a value at the given path. If no value is found, returns the path.
		function resolvePath(replacementVariablePath) {
			return replacementVariablePath.trim().split('.').reduce((prev, curr) => {
				if (prev && typeof prev === 'object') {
					return prev[curr];
				}
				return undefined;
			}, context);
		}
		
		// Uses a regex to find all placeholders and run resolvePath() with them
		function replaceInValue(value) {
			let regex = /{(.*)}/g;
			return value.replace(regex, (match, p1) => {
				let returnValue = resolvePath(p1);
				let resolved;
				if (typeof returnValue === "string") {
					resolved = returnValue;	
				} else {
					// if the result is not a string, turn it into a string
					resolved = JSON.stringify(returnValue);
				}
				return resolved !== undefined ? resolved : match;
			});
		}

		function recursiveReplace(rawObject) {
			if (typeof rawObject === 'string') {
				// End recursion, run replaceInValue() to find and replace placeholders
				let updatedValue = replaceInValue(rawObject);
				try {
					// attempts to convert to and return a JSON version of the updated value
					return JSON.parse(updatedValue);
				} catch (e) {
					// Will fail if the updated value is not JSON or Array, returns updatedValue as is
					return updatedValue;
				}
			} else if (Array.isArray(rawObject)) {
				// Recurses again if the value is an array for each item in the array
				return rawObject.map(item => recursiveReplace(item));
			} else if (rawObject !== null && typeof rawObject === 'object') {
				// Recurses again if the value is an object for each value in the object
				const result = {};
				for (const key in rawObject) {
					if (rawObject.hasOwnProperty(key)) {
						result[key] = recursiveReplace(rawObject[key]);
					}
				}
				// result of the recursed object
				return result;
			}
			// Catch all
			return rawObject;
		}

		async function performApiCall(apiCallDetails, apiCallBody) {
			// Destructure the necessary details from apiCallDetails
			const { method, url, header } = apiCallDetails[0];
			const headers = {};

			if (header != null) {
				// Build headers object from the header array
				header.forEach(h => {
					headers[h.header_title] = h.header_content;
				});
			}
			let apiResponse;

			if (apiCallBody != null) {
				// Execute the fetch request with the provided details and capture the response
				apiResponse = await fetch(apiCallDetails[0].url, {
					method: apiCallDetails[0].method,
					headers: headers != null ? headers : null,
					body: JSON.stringify(apiCallBody),
				}).then(response => { return response.json() })
			} else {
				// Execute the fetch request with the provided details and capture the response
				apiResponse = await fetch(apiCallDetails[0].url, {
					method: apiCallDetails[0].method,
					headers: headers != null ? headers : null,
				}).then(response => { return response.json() })
			}
			apiData.response = apiResponse;
			return apiResponse;
		}
	},
};

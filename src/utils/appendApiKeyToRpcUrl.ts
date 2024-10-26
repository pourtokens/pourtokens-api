export const appendApiKeyToRpcUrl = (
	rpcUrl: string,
	apiKey: string | undefined
) => {
	if (apiKey && rpcUrl.includes("infura.io")) {
		return `${rpcUrl}/v3/${apiKey}`;
	}
	return rpcUrl;
};

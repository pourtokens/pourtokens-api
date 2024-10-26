export interface Network {
	name: string;
	type: string;
	rpcUrl: string;
	symbol: string;
}

export interface Balance {
	networkName: string;
	amount: string | null;
	symbol: string;
}

export interface WalletServiceConfig {
	privateKey: string;
	networks: Network[];
}

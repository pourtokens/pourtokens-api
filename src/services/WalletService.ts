import { ethers } from "ethers";
import { Network, Balance, WalletServiceConfig } from "../types/wallet";
import { logger } from "../utils/logger";
import { appendApiKeyToRpcUrl } from "../utils/appendApiKeyToRpcUrl";

export class WalletService {
	private readonly privateKey: string;
	private readonly networks: Network[];
	private readonly infuraApiKey = process.env.INFURA_API_KEY!;

	constructor(config: WalletServiceConfig) {
		this.privateKey = config.privateKey;
		this.networks = config.networks;

		this.networks.forEach((network) => {
			network.rpcUrl = appendApiKeyToRpcUrl(
				network.rpcUrl,
				this.infuraApiKey
			);
		});
	}

	private async getBalance(
		wallet: ethers.Wallet,
		provider: ethers.Provider
	): Promise<string | null> {
		try {
			await wallet.connect(provider);
			const address = await wallet.getAddress();
			const balanceInWei = await provider.getBalance(address);

			return ethers.formatEther(balanceInWei);
		} catch (error) {
			logger.error("Error fetching balance:", error);
			return null;
		}
	}

	public async getBalances(): Promise<Balance[]> {
		return Promise.all(
			this.networks.map(async (network) => {
				const wallet = new ethers.Wallet(this.privateKey);
				const provider = new ethers.JsonRpcProvider(network.rpcUrl);

				const balance = await this.getBalance(wallet, provider);

				return {
					networkName: network.name,
					amount: balance,
					symbol: network.symbol,
				};
			})
		);
	}

	public async getTestnetBalances(): Promise<Balance[]> {
		const testNetworks = this.networks.filter(
			(network) => network.type === "testnet"
		);

		return Promise.all(
			testNetworks.map(async (network) => {
				const wallet = new ethers.Wallet(this.privateKey);
				const provider = new ethers.JsonRpcProvider(network.rpcUrl);

				const balance = await this.getBalance(wallet, provider);

				return {
					networkName: network.name,
					amount: balance,
					symbol: network.symbol,
				};
			})
		);
	}

	public async getAddress(): Promise<string> {
		const wallet = new ethers.Wallet(this.privateKey);
		return wallet.getAddress();
	}
}

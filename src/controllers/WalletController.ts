import { Request, Response } from "express";
import { WalletService } from "../services/WalletService";
import { Network } from "../types/wallet";
import { logger } from "../utils/logger";

export class WalletController {
	private walletService: WalletService;

	constructor(privateKey: string, networks: Network[]) {
		this.walletService = new WalletService({
			privateKey,
			networks,
		});
	}

	public getAddress = async (req: Request, res: Response): Promise<void> => {
		try {
			const address = await this.walletService.getAddress();
			res.status(200).json({ address });
		} catch (error) {
			logger.error("Error in WalletController.getAddress:", error);
			res.status(500).json({
				message: "Error fetching address",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	};

	public getBalances = async (req: Request, res: Response): Promise<void> => {
		try {
			const balances = await this.walletService.getTestnetBalances();
			res.status(200).json({ balances });
		} catch (error) {
			logger.error("Error in WalletController.getBalances:", error);
			res.status(500).json({
				message: "Error fetching balances",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	};
}

import { Router } from "express";
import { WalletController } from "../controllers/WalletController";
import { validateEnv } from "../middlewares/validateEnv";
import networks from "../networks.json";

const router = Router();

const walletController = new WalletController(
	process.env.WALLET_PRIVATE_KEY!,
	networks
);

router.get(
	"/wallet/balances",
	validateEnv(["WALLET_PRIVATE_KEY"]),
	walletController.getBalances
);

router.get(
	"/wallet/address",
	validateEnv(["WALLET_PRIVATE_KEY"]),
	walletController.getAddress
);

export default router;

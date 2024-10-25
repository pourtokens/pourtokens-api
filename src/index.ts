import express, {
	Express,
	Request,
	Response,
	NextFunction,
	RequestHandler,
} from "express";
import { ethers } from "ethers";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { sendTelegramNotification } from "./notification/telegramNotification";
import networks from "./networks.json";

const app: Express = express();

const PORT = process.env.PORT || 5000;

const infuraApiKey = process.env.INFURA_API_KEY;

const corsOptions = {
	origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

interface Bundle {
	token: string;
	amountRequested: number;
}

interface TransactionDetails {
	chain: string;
	token: string;
	amountPaid: number;
}

interface RequestBody {
	bundle: Bundle;
	depositAddress: string;
	transactionDetails: TransactionDetails;
}

const appendApiKeyToRpcUrl = (rpcUrl: string, apiKey: string | undefined) => {
	if (apiKey && rpcUrl.includes("infura.io")) {
		return `${rpcUrl}/v3/${apiKey}`;
	}
	return rpcUrl;
};

networks.forEach((network) => {
	network.rpcUrl = appendApiKeyToRpcUrl(network.rpcUrl, infuraApiKey);
});

const getBalance = async (wallet: ethers.Wallet, provider: ethers.Provider) => {
	wallet.connect(provider);

	try {
		const address = await wallet.getAddress();
		const balanceInWei = await provider.getBalance(address);
		const balance = ethers.formatEther(balanceInWei);

		return balance;
	} catch (error) {
		console.error("Error fetching balance: ", error);
	}
};

const getBalancesHandler: RequestHandler = async (
	req: Request,
	res: Response
) => {
	const privateKey = process.env.WALLET_PRIVATE_KEY as string;

	if (!privateKey) {
		res.status(500).json({
			message: "Crucial environment variables are not set",
		});
	}

	const balances: {
		networkName: string;
		amount: string | null;
		symbol: string | undefined;
	}[] = [];

	const testNetworks: any[] = networks.filter(
		(network) => network.type === "testnet"
	);

	for (const network of testNetworks) {
		const providerUrl = network.rpcUrl;
		const wallet = new ethers.Wallet(privateKey);
		const provider = new ethers.JsonRpcProvider(providerUrl);

		const balance = await getBalance(wallet, provider);
		balances.push({
			networkName: network.name,
			amount: balance || null,
			symbol: network.symbol,
		});
	}

	res.status(200).json({ balances });
};

app.get("/balances", getBalancesHandler);

app.post(
	"/transaction",
	async (req: Request, res: Response, next: NextFunction) => {
		const { bundle, depositAddress, transactionDetails }: RequestBody =
			req.body;

		if (!bundle || !depositAddress || !transactionDetails) {
			res.status(400).send(
				"All fields are required: bundle, depositAddress, transactionDetails"
			);
			return;
		}

		const requiredBundleProperties = ["token", "amountRequested"];
		const requiredTransactionProperties = ["chain", "token", "amountPaid"];

		const hasRequiredProperties = (obj: any, properties: string[]) =>
			properties.every((prop) => obj.hasOwnProperty(prop));

		if (
			!hasRequiredProperties(bundle, requiredBundleProperties) ||
			!hasRequiredProperties(
				transactionDetails,
				requiredTransactionProperties
			)
		) {
			res.status(400).send("Invalid bundle or transaction details");
			return;
		}

		try {
			// Process the transaction here
			console.log("Bundle: ", bundle);
			console.log("Deposit Address: ", depositAddress);
			console.log("Transaction Details: ", transactionDetails);

			await sendTelegramNotification(
				`Deposit <strong>${bundle.amountRequested} ${bundle.token}</strong> to address: <a href="https://etherscan.io/address/${depositAddress}">${depositAddress}</a>`
			);

			res.status(200).send("Transaction processed successfully");
		} catch (notificationError) {
			console.error(
				"Error sending Telegram notification:",
				notificationError
			);

			res.status(500).send(
				"Error processing transaction: Unable to send notification"
			);
		}
	}
);

// Start the server
app.listen(PORT, () => {
	console.log(`[server]: Server is running at port ${PORT}`);

	if (process.env.NODE_ENV === "production") {
		sendTelegramNotification("Server is up and running...");
	}
});

// Export for testing purposes
export default app;

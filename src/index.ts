import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

import { sendTelegramNotification } from "./notification/telegramNotification";

const app: Express = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

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

			sendTelegramNotification(
				`Deposit <strong>${bundle.amountRequested} ${bundle.token}</strong> to address: <a href="https://etherscan.io/address/${depositAddress}">${depositAddress}</a>`
			);

			res.status(200).send("Transaction processed successfully");
		} catch (error) {
			next(error);
		}
	}
);

app.listen(PORT, () => {
	console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

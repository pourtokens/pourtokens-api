import { Request, Response, NextFunction, RequestHandler } from "express";

export const validateEnv = (requiredEnvVars: string[]): RequestHandler => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const missingVars = requiredEnvVars.filter(
			(envVar) => !process.env[envVar]
		);

		if (missingVars.length > 0) {
			res.status(500).json({
				message: "Crucial environment variables are not set",
				missing: missingVars,
			});
			return;
		}

		next();
	};
};

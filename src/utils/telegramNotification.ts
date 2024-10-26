import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(",") || [];

export const sendTelegramNotification = async (message: string) => {
	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

	if (process.env.NODE_ENV !== "production") {
		message = `<strong>THIS IS A TEST MESSAGE: DO NOT REPLY</strong>\n${message}`;
	}

	for (const CHAT_ID of CHAT_IDS) {
		const params = {
			chat_id: CHAT_ID,
			text: message,
			parse_mode: "HTML",
		};

		try {
			await axios.post(url, params);
		} catch (error) {
			console.error(
				`Failed to send message to chat ID ${CHAT_ID}:`,
				error
			);
		}
	}
};

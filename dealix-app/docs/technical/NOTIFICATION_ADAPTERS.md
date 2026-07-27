# Future notification adapters

DealiX currently sends alerts only inside the locally saved application state. Checks run only while the app is open or when a user chooses **Run Now**.

Future delivery can use a small adapter boundary: `InAppNotifier`, `DiscordWebhookNotifier`, `EmailNotifier`, and `PushNotifier`. No delivery adapter is configured today. Webhook URLs and API keys must remain outside the repository and must never be stored in browser localStorage.

## Current server adapters

eBay Browse API and Discord webhook calls run only in Next.js server routes. Put credentials in `.env.local` using `.env.example` as a blank template. The browser only receives connection status and normalized marketplace results. Discord embeds use disabled mentions and sanitized content.

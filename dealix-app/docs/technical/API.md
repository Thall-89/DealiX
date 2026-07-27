# Marketplace and notification setup

`POST /api/marketplaces/ebay/search` is a server-only bridge to eBay's official Browse API. Configure an eBay developer application, set `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_MARKETPLACE_ID`, and `EBAY_ENVIRONMENT` in `.env.local`, then use Market Intelligence's **Live eBay Search** action. Sandbox and production have separate endpoints.

`POST /api/notifications/discord/test` sends a connection test only when `DISCORD_WEBHOOK_URL` is configured. Never commit credentials or webhook URLs. Production monitoring also needs a server database for saved searches/fingerprints plus a protected worker endpoint using `CRON_SECRET`.

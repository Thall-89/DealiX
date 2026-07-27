# Architecture Notes

DealiX uses a Next.js app router structure with shared components, local mock data, and browser-based storage.

## Architecture choices

- Shared shell for the overall UI
- Reusable components for cards, headers, status badges, and navigation
- Mock data in the shared data module
- Local browser storage for editable mock records
- Server-only eBay and Discord adapters; no credentials reach client components
- A disabled Cloudflare Worker blueprint for future server-backed scheduled monitoring
- Repository boundary: `localRepository` for demo mode and `supabaseRepository` for signed-in cloud snapshots

## Future-ready areas

- Feature placeholders for marketplace APIs and AI providers
- Shared types for builds, tasks, and notifications
- Routing ready for dedicated build and part detail pages

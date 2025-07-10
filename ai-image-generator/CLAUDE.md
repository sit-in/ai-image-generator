# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Environment Setup

Create a `.env.local` file with the following variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Replicate API (Required)
REPLICATE_API_TOKEN=
REPLICATE_MODEL=black-forest-labs/flux-schnell
```

## Architecture Overview

This is a commercial AI image generation service with a credit-based payment system. The project uses Next.js 14 with App Router and integrates multiple services:

### Core Components

1. **Authentication & User Management**
   - Supabase Auth handles user registration/login
   - Client-side auth: `lib/supabase.ts`
   - Server-side auth: `lib/supabase-server.ts` (uses service role key)
   - User ID persisted in localStorage for quick access

2. **Credit System**
   - New users receive 30 credits
   - Each image costs 10 credits
   - Credit operations are atomic with rollback support
   - Three redeem code tiers: BASIC (100), STANDARD (300), PREMIUM (1000)

3. **Image Generation Flow**
   - User submits prompt + style → API validates credits → Replicate generates image → Image saved to Supabase Storage → Credits deducted → History recorded
   - Supported styles: Natural, Anime, Oil painting, Watercolor, Pixel art, Studio Ghibli
   - Images permanently stored in Supabase Storage bucket `generated-images`

4. **Database Schema**
   - `user_credits`: User credit balances
   - `credit_history`: Transaction logs
   - `generation_history`: Image generation records with metadata
   - `generations`: Active generation tracking
   - `redeem_codes`: Redeem code management
   - `profiles`: User profiles with admin flag

### Key API Routes

- `/api/generate-image`: Main image generation endpoint
- `/api/credits`: Credit balance and history
- `/api/redeem`: Process redeem codes
- `/api/admin/generate-codes`: Admin code generation

### Admin Features

Admin panel at `/admin/redeem-codes` allows:
- Batch generation of redeem codes
- Export unused codes as CSV
- View code usage statistics

### Integration Points

1. **Supabase**: Provides authentication, PostgreSQL database, and file storage
2. **Replicate API**: AI model hosting for image generation
3. **Taobao**: External payment processing (manual code distribution)

### Security Considerations

- Row-level security enabled in Supabase
- Service role key only used server-side
- Credit validation before any generation
- Admin access controlled via `profiles.is_admin`

### Common Development Tasks

When modifying the image generation flow:
1. Check credit validation in `/app/api/generate-image/route.ts`
2. Update style mappings if adding new styles
3. Ensure atomic credit operations

When working with the credit system:
1. Always use transactions for credit updates
2. Log all credit changes to `credit_history`
3. Validate redeem codes server-side only

When updating UI components:
1. Use shadcn/ui components from `/components/ui`
2. Follow existing Tailwind CSS patterns
3. Maintain Chinese localization throughout
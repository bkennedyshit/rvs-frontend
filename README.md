# RVS Onboarding Frontend

A configurable multi-step onboarding wizard built with Next.js 16, Tailwind CSS 4, and Supabase.

## Features

- 3-step onboarding flow (account creation → profile details → completion)
- Admin panel to reassign form components between pages
- Data table view showing all registered users and their profiles
- Returning user detection — resumes from where they left off
- Fully responsive dark UI

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Supabase** (Postgres + client SDK)
- **TypeScript**

## Getting Started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

3. Set up the required Supabase tables (see [Database Schema](#database-schema) below).

4. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the onboarding wizard.

## Pages

| Route    | Description                                  |
| -------- | -------------------------------------------- |
| `/`      | Onboarding wizard (3-step flow)              |
| `/admin` | Admin config — assign components to pages    |
| `/data`  | Data table — view all users and profiles     |

## Database Schema

The app expects three Supabase tables:

**`rvs_users`** — user accounts

| Column        | Type        | Notes              |
| ------------- | ----------- | ------------------ |
| id            | int8 (PK)   | Auto-increment     |
| email         | text        | Unique             |
| password_hash | text        | Hashed password    |
| current_step  | int4        | 1–4 (4 = complete) |
| created_at    | timestamptz | Default now()      |
| updated_at    | timestamptz |                    |

**`rvs_user_profiles`** — profile data collected during onboarding

| Column         | Type        | Notes          |
| -------------- | ----------- | -------------- |
| id             | int8 (PK)   | Auto-increment |
| user_id        | int8 (FK)   | → rvs_users.id |
| about_me       | text        | Nullable       |
| street_address | text        | Nullable       |
| city           | text        | Nullable       |
| state          | text        | Nullable       |
| zip            | text        | Nullable       |
| birthdate      | date        | Nullable       |
| updated_at     | timestamptz |                |

**`rvs_onboarding_config`** — controls which components appear on which page

| Column         | Type | Notes                          |
| -------------- | ---- | ------------------------------ |
| component_name | text | `about_me`, `address`, `birthdate` |
| page_number    | int4 | 2 or 3                         |
| updated_at     | timestamptz |                           |

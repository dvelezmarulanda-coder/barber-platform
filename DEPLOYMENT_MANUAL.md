# Barber Platform - Deployment Guide (Agency Model)

This guide explains how to deploy a new instance of the Barber Platform for a **new client** (e.g., "Barbería Don Pepe").

## 1. Local Setup
1.  **Clone the Codebase**: Copy the project folder to a new location for the client.
    ```bash
    cp -r barber-platform barberia-don-pepe
    cd barberia-don-pepe
    ```
2.  **Clean Git**: Remove the old `.git` folder to start fresh.
    ```bash
    rm -rf .git
    git init
    ```

## 2. Remote Backend (Supabase)
1.  Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a **New Project**.
2.  Name it (e.g., `barberia-don-pepe`) and set the password.
3.  **Database Setup**:
    - Go to **SQL Editor** in the left sidebar.
    - Open `supabase/schema_full.sql` from your local project.
    - Paste the content into the SQL Editor and click **RUN**.
    - *Success Check*: Verify that tables (`citas`, `perfiles`, etc.) appear in the Table Editor.
4.  **Auth Configuration**:
    - Go to **Authentication > Providers**.
    - Enable **Google** (instructions provided by Supabase) or keep just **Email**.
    - Under **URL Configuration**, set the `Site URL` to your production URL (or `http://localhost:3000` for dev).

## 3. Environment Variables
1.  In Supabase, go to **Project Settings > API**.
2.  Copy `Project URL` and `anon public` key.
3.  Create/Update `.env.local` in your project folder:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
    ```

## 4. Frontend Deployment (Vercel)
1.  Push your code to GitHub.
2.  Go to [Vercel](https://vercel.com) -> **Add New Project**.
3.  Import the repository.
4.  Adding Environment Variables:
    - Vercel will ask for Environment Variables. Add the same ones from `.env.local`.
5.  Click **Deploy**.

## 5. Post-Deployment (Create Admin)
Once deployed, you need to create the first Admin user (the barber owner).
1.  Go to your deployed site: `https://barberia-don-pepe.vercel.app`.
2.  **Sign Up** with the owner's email (e.g., `owner@barber.com`).
3.  Go back to **Supabase SQL Editor**.
4.  Run this SQL to promote them to Admin:
    ```sql
    UPDATE perfiles 
    SET rol = 'admin' 
    WHERE email = 'owner@barber.com';
    ```
5.  Refresh the app. They should now see the Admin Panel.

---
**Done!** You have a fully isolated, production-ready app for your client.

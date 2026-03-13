# Artspace — Youth Art Community & Portfolio Platform

## What this project is
A community platform and portfolio generator for young artists aged 13–18,
trained under a professional art teacher/guru.

## Two types of users
- ARTIST: can post artwork, build a profile, auto-generate a college portfolio
- BUYER/VISITOR: can browse and inquire about artwork only

## Tech stack
- Frontend: React + Vite + TailwindCSS (in /client)
- Backend: Node.js + Express (in /server)
- Database + Auth + File Storage: Supabase
- Deployment: Vercel (frontend) + Vercel serverless (backend)

## Database tables
- users: id, email, type (artist/buyer), display_name, avatar_url, about_me,
         mediums (array), categories (array), topics (array),
         training_start_year, lat, lng, country, approved, created_at
- artworks: id, user_id, title, medium, category, year, description,
            image_url, in_portfolio, created_at
- likes: id, user_id, artwork_id, created_at
- comments: id, user_id, artwork_id, content, created_at

## Design rules (always follow these)
- Background: dark (#0e0c0a), text: cream (#f0ead8), accent: burnt orange (#e05c22)
- Heading font: DM Serif Display (Google Fonts)
- UI font: Syne (Google Fonts)
- Artwork cards in a masonry/Pinterest-style grid
- Cards tilt 2-3 degrees on hover
- Replace the cursor sitewide with a paintbrush SVG that leaves a fading dot trail
- Paint splatter animation instead of loading spinners
- Buttons: fill-up-from-bottom animation on hover
- Page elements fade up when they scroll into view

## Features to build (in order)
1. Sign-up with user type selection (Artist vs Buyer)
2. Artist onboarding form
3. Community feed (masonry grid)
4. Artist profile page
5. Auto-generated portfolio page
6. Artwork upload
7. Interactive globe on landing page
8. Admin panel

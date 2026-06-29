# SEAPEDIA Frontend Setup & Deployment

## Requirements
- Node.js (v18+)
- npm or yarn or pnpm

## Installation Steps
1. Clone the repository and navigate to the frontend folder (`frontend`).
2. Run `npm install` (or `yarn install` / `pnpm install`) to install all dependencies.
3. Create a `.env` file based on `.env.example` and set the backend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Deployment Build
To build the application for production deployment:
```bash
npm run build
```
The output will be placed in the `dist/` directory, which can be served by Nginx, Apache, Vercel, Netlify, or any static file host.

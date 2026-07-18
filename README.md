# MedCare Healthcare Platform

This is a comprehensive healthcare platform featuring a React frontend and an Express/SQLite backend.

## Architecture & Database

This project operates completely locally using an **SQLite** database (`server/medcare.db`). 
There is no reliance on Vercel or MongoDB, meaning you can test brutally and safely locally. The data is entirely self-contained.

### Setting up the Database

1. Install dependencies:
   ```bash
   npm i
   ```

2. Seed the SQLite database with initial demo data (doctors, medicines, test appointments):
   ```bash
   node server/seed.js
   ```

### Running the App Locally

To start the backend API and frontend Vite server concurrently:
```bash
npm run dev:full
```
- The Vite frontend will typically be on `http://localhost:5173`
- The Express API backend will be on `http://localhost:3001`

### Running Automated API Tests

You can verify that all SQLite queries and API endpoints are functioning properly by running the automated test script:
```bash
node server/test_api.js
```
This tests CRUD operations across doctors, medicines, patients, and appointments.

### Running End-to-End Visual Tests

The platform features a fully comprehensive suite of Playwright E2E tests simulating real user flows. To run tests interactively and visually verify that all final states are displayed:
```bash
python3 visual_test.py
```
Or to run tests headlessly via Playwright directly:
```bash
npx playwright test
```

### Attributions

This Figma Make file includes components from [shadcn/ui](https://ui.shadcn.com/) used under [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

This Figma Make file includes photos from [Unsplash](https://unsplash.com) used under [license](https://unsplash.com/license).
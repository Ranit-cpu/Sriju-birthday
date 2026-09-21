# Sriju Birthday

A premium, client-only birthday experience for Sriju. It is built with Vite, React, TypeScript, Tailwind CSS, and Framer Motion, so it can be hosted as a static site on Vercel.

## Run locally

```bash
npm install
npm run dev
```

The production build is:

```bash
npm run build
npm run preview
```

## Add or replace photos

Drop photos into `src/assets/images/`. The gallery and the floating hero cards use a Vite glob import, so there is no filename list to update. Any number of images works, and the CSS normalizes portrait and landscape photos with `object-fit: cover`.

Keep the original image files in the folder. The project does not destructively compress or resize them.

## Edit the birthday letter

Open `src/App.tsx` and edit the exported `BIRTHDAY_LETTER` constant. It is the single source of truth for the letter text shown on the page.

## Deploy with the Vercel CLI

From the project folder:

```bash
npm install
npm run build
npx vercel
npx vercel --prod
```

When prompted by the CLI, choose the Vite project defaults. `vercel.json` already points Vercel at the correct `dist/public` output directory.

## Deploy from the Vercel dashboard

1. Push this project to a GitHub, GitLab, or Bitbucket repository.
2. Open the Vercel dashboard and choose **Add New → Project**.
3. Import the repository.
4. Keep the detected framework as **Vite**.
5. Confirm the build command is `npm run build` and the output directory is `dist/public`.
6. Choose **Deploy**.

No environment variables, backend, database, or third-party API keys are required.

# My AI Advisor App

My AI Advisor App is a web-based application built with Next.js that allows users to interact with an AI-powered advisor. 
The app is configured with mock JSON data for local development, meaning no real database connection is required.

## Features

- **AI-powered interaction** – Simulated responses from a mock AI advisor.
- **Local JSON data storage** – No database setup needed.
- **Next.js framework** – For server-side rendering and fast performance.
- **TypeScript support** – Ensures type safety.
- **Tailwind CSS styling** – For responsive and modern UI design.

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data:** Local JSON files (no external DB)
- **Version Control:** Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Nirajmakwana/my-ai-advisor-app
   cd my-ai-advisor-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
my-ai-advisor-app/
│── public/             # Static assets
│── src/                # Main source code
│   ├── components/     # Reusable UI components
│   ├── pages/          # Next.js pages
│   ├── styles/         # Tailwind CSS styles
│   ├── data/           # Mock JSON data files
│── package.json        # Project dependencies
│── README.md           # Project documentation
│── .gitignore          # Files ignored by Git
```

## Mock Data

The app uses local JSON files stored in `src/data/` to simulate database responses.

Example file:
```json
{
  "id": 1,
  "name": "AI Advisor",
  "specialty": "Business Strategy"
}
```

## Deployment

To deploy on **Vercel**:

1. Push your project to GitHub.
2. Connect your GitHub repo to Vercel.
3. Deploy with default settings.

## License

This project is licensed under the MIT License.

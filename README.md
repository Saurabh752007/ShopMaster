# ShopMaster Pro - Developer Setup

This project uses the **Google Gemini API** (@google/genai) to power the "AI Strategy Consultant" feature in the Export Management view.

## API Configuration

To use the AI features locally, you must provide a valid Gemini API key.

1. Create a `.env` file in the project root.
2. Add your API key using the following variable name:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

The application is configured to automatically pick up this key from `process.env.API_KEY`.

## Key Features
- **AI Strategy Consultant**: Uses `gemini-3-flash-preview` to analyze your shop's inventory and sales data.
- **Search Grounding**: Provides real-world web resources for business growth suggestions.
- **Inventory Management**: Full local-storage persistence for products, employees, and customers.

## Getting a Key
You can obtain an API key for free (within rate limits) from the [Google AI Studio](https://aistudio.google.com/).

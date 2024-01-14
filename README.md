# Brain Bridge

Telegram-integrated AI tool that leverages OpenAI's Assistant API for efficient tagging and categorization of thoughts and ideas. It simplifies thought organization by seamlessly syncing with your Notion DB.

## Prerequisites

1. Dedicated compute instance to host the Telegram bot.
2. OpenAI plus subscription plan.
3. Telegram account.
4. Deepgram account (optional).

## Step-by-Step Installation Guide

### Creating a telegram bot

1. Follow [this guide](https://core.telegram.org/bots/tutorial) to create your bot.
2. Place the obtained API key in the `.env` file: (`TELEGRAM_API_KEY=<your key>`).

### Obtain API Keys:

1. Obtaining Notion API key ([link](https://www.google.com/search?q=notion+get+api+key&oq=notion+get+api+key&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgwIARAjGCcYgAQYigUyDAgCECMYJxiABBiKBTIMCAMQABhDGIAEGIoFMgwIBBAAGEMYgAQYigUyDAgFEAAYQxiABBiKBTIMCAYQABhDGIAEGIoFMgwIBxAAGEMYgAQYigUyBwgIEAAYgAQyBwgJEAAYgATSAQgyOTIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8)). Add it to your `.env` file (`NOTION_API_KEY`).
2. Obtaining OpenAI API key ([link](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key)). Add it to your `.env` file (`OPENAI_API_KEY`).
3. Optional: create a [Deepgram](https://deepgram.com/) account to get your API key (only required if you want to use speech recognition).

### Setup OpenAI Assistant:

1. Visit https://platform.openai.com/assistants.
2. Create a new assistant.
3. The instructions can be [found here](https://github.com/Mosquid/gpt-telebot/blob/main/openai/prompt.txt).
4. Add `save_entry` function. The function's JSON can be [found here](https://github.com/Mosquid/gpt-telebot/blob/main/openai/save_entry.fn.json).
5. Select the GPT-4 model and copy the assistant ID (formatted as `asst_`) to your `.env` file (`OPENAI_ASSISTANT_ID`).

### Setting up Notion

1. Create a new page and insert a database ([guide](https://www.notion.so/help/intro-to-databases)).
2. Click on the 3-dot menu in the header section of your database view and select `Copy link to view`.
3. The link you'll get will look like this: `https://www.notion.so/[YOUR_DATABASE_ID]?v[VIEW_ID]&pvs=[INT]`.
4. Copy your database ID from the url and add it your .env file (`NOTION_DATABASE_ID=`).
5. Click on the 3-dot menu in the top right corner of your page and click on `+ add connection`. Select the integration you created. If you haven't yet, please follow [this guide](https://www.google.com/search?q=notion+get+api+key&oq=notion+get+api+key&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgwIARAjGCcYgAQYigUyDAgCECMYJxiABBiKBTIMCAMQABhDGIAEGIoFMgwIBBAAGEMYgAQYigUyDAgFEAAYQxiABBiKBTIMCAYQABhDGIAEGIoFMgwIBxAAGEMYgAQYigUyBwgIEAAYgAQyBwgJEAAYgATSAQgyOTIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8).

### Restricting access to your Telegram bot

Add the `WHITELIST` property to your `.env`, which should contain your Telegram username. This way only you can interact with your bot even if other people will discover it.

### Environment variables

If you did everything right, your `.env' file should look something like this:

```env
OPENAI_API_KEY=
OPENAI_ASSISTANT_ID=
TELEGRAM_API_KEY=
DEEPGRAM_API_KEY=
NOTION_API_KEY=
NOTION_DATABASE_ID=
WHITELIST=
```

## Deployment

You'll need a server with Git and Node.js installed.
Simply clone the project, run `yarn build` (or `npm build`) and create a `.env` file in the `dist` folder. Use a tool like PM2 to start a process on your server.

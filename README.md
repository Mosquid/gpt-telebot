# Brain Bridge

Telegram-integrated AI tool that leverages OpenAI's Assistant API for efficient tagging and categorization of thoughts and ideas. It simplifies thought organization by seamlessly syncing with your Notion DB.

## Installation Resources

1. Dedicated compute instance for hosting the telegram bot.
2. OpenAI plus subscription plan.
3. Telegram account
4. Deepgram account (optional)

## Deployment and configuration

### Creating a telegram bot

1. Follow [this guide](https://core.telegram.org/bots/tutorial) to create a telegram bot.
2. Once you get your bot API key, place it in the `.env` file (`TELEGRAM_API_KEY=<your key>`).

### Obtaining API keys

1. Obtaining Notion API key ([link](https://www.google.com/search?q=notion+get+api+key&oq=notion+get+api+key&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgwIARAjGCcYgAQYigUyDAgCECMYJxiABBiKBTIMCAMQABhDGIAEGIoFMgwIBBAAGEMYgAQYigUyDAgFEAAYQxiABBiKBTIMCAYQABhDGIAEGIoFMgwIBxAAGEMYgAQYigUyBwgIEAAYgAQyBwgJEAAYgATSAQgyOTIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8)). Add it to your `.env` file (`NOTION_API_KEY`).
2. Obtaining OpenAI API key ([link](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key)). Add it to your `.env` file (`OPENAI_API_KEY`).
3. Optional: create a [Deepgram](https://deepgram.com/) account to get your API key (only required if you want to use speech recognition).

### Setting up OpenAI assistant

1. Visit https://platform.openai.com/assistants.
2. Create a new assistant.
3. The instructions could be [found here](https://github.com/Mosquid/gpt-telebot/blob/main/openai/prompt.txt).
4. Add `save_entry` function. The function's JSON can be [found here](https://github.com/Mosquid/gpt-telebot/blob/main/openai/save_entry.fn.json).
5. Select gpt-4 model.
6. Once your assistant is ready, copy its ID (can be found either in URL or under assistant's name). It's a string that starts with `asst_`. Paste it in your `.env` (`OPENAI_ASSISTANT_ID=`).

### Setting up Notion

1. Create a new page and insert a database ([guide](https://www.notion.so/help/intro-to-databases)).
2. Click on 3-dot-menu in the header section of your database view and select `Copy link to view`.
3. The link you'll get will look like this: `https://www.notion.so/[YOUR_DATABASE_ID]?v[VIEW_ID]&pvs=[INT]`.
4. Copy your database ID from the url and add it your .env file (`NOTION_DATABASE_ID=`).

### Restricting access to your Telegram bot

Add `WHITELIST` property to your `.env`, which contains your Telegram username. This way only you can interract with your bot even if other people will discover it.

### Environment variables

If you did everything right, your `.env' file should look something like this:

```env
OPENAI_API_KEY=
OPENAI_ASSISTANT_ID=
TELEGRAM_API_KEY=
DEEPGRAM_API_KEY=
NOTION_API_KEY=
NOTION_DATABASE_ID=
```

## Deployment

You'll need a server with Git and Node.js installed.
Simply clone the project, run `yarn build` (or `npm build`) and create a `.env` file in the `dist` folder. Use a tool like PM2 to start a process on your server.

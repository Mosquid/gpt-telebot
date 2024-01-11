// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Client } from "@notionhq/client";
export type NotionPagePayload = {
  summary: string;
  category: string;
  tags: string[];
};

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function notionCreatePage(payload: NotionPagePayload) {
  const { summary, category, tags } = payload;
  const myPage = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DATABASE_ID || "",
    },
    properties: {
      Summary: {
        title: [
          {
            text: {
              content: summary,
            },
          },
        ],
      },
      Category: {
        rich_text: [
          {
            text: {
              content: category,
            },
          },
        ],
      },
      Tags: {
        multi_select: tags
          ? tags.map((tag: string) => {
              return {
                name: tag,
              };
            })
          : [],
      },
    },
  });

  return myPage;
}

"use strict";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notionCreatePage = void 0;
const client_1 = require("@notionhq/client");
const notion = new client_1.Client({
    auth: process.env.NOTION_API_KEY,
});
function notionCreatePage(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const { summary, category, tags, content } = payload;
        const myPage = yield notion.pages.create({
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
                        ? tags.map((tag) => {
                            return {
                                name: tag,
                            };
                        })
                        : [],
                },
            },
            children: [
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: content || "",
                                },
                            },
                        ],
                    },
                },
            ],
        });
        return myPage;
    });
}
exports.notionCreatePage = notionCreatePage;

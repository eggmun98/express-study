const createPayload = (page_id, title) => ({
  parent: { page_id },
  properties: {
    title: {
      title: [{ text: { content: title } }],
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
            text: { content: "페이지 내용이에요~~~~~~~~~~~~~~₩." },
          },
        ],
      },
    },
    {
      object: "block",
      paragraph: {
        rich_text: [
          {
            text: {
              content:
                "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
              link: {
                url: "https://en.wikipedia.org/wiki/Lacinato_kale",
              },
            },
            href: "https://en.wikipedia.org/wiki/Lacinato_kale",
          },
        ],
        color: "default",
      },
    },
    {
      object: "block",
      heading_2: {
        rich_text: [
          {
            text: {
              content: "Lacinato kale",
            },
          },
        ],
      },
    },
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { type: "emoji", emoji: "🚀" },
        rich_text: [{ type: "text", text: { content: "콜아웃 내용" } }],
      },
    },
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "토글 내용" } }],
      },
    },
    {
      object: "block",
      type: "to_do",
      to_do: {
        checked: false,
        rich_text: [{ type: "text", text: { content: "할 일 내용" } }],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [{ type: "text", text: { content: "번호 목록 내용" } }],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [{ type: "text", text: { content: "번호 목록 내용" } }],
      },
    },
    {
      object: "block",
      type: "quote",
      quote: {
        rich_text: [{ type: "text", text: { content: "인용된 내용" } }],
      },
    },
    {
      object: "block",
      type: "heading_1",
      heading_1: {
        rich_text: [{ type: "text", text: { content: "제목 " } }],
      },
    },
  ],
});

module.exports = {
  createPayload,
};

// 노션 JSON 구조
const createPayload = (title, state, createDate, id, explanation, dbId) => {
  return {
    parent: { database_id: dbId },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      State: {
        select: {
          name: state,
        },
      },
      CreateDate: {
        rich_text: [
          {
            text: {
              content: createDate,
            },
          },
        ],
      },
      IssueID: {
        rich_text: [
          {
            text: {
              content: id,
            },
          },
        ],
      },
      Explanation: {
        rich_text: [
          {
            text: {
              content: explanation,
            },
          },
        ],
      },
    },
  };
};

const createPayload02 = (title, state, createDate, id, dbId) => {
  return {
    parent: { database_id: dbId },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      State: {
        select: {
          name: state,
        },
      },
      CreateDate: {
        rich_text: [
          {
            text: {
              content: createDate,
            },
          },
        ],
      },
      IssueID: {
        rich_text: [
          {
            text: {
              content: id,
            },
          },
        ],
      },
    },
  };
};

const createPayload03 = (title) => {
  return {
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
  };
};

const createPayload04 = (title, state, createDate, id, dbId) => {
  return {
    parent: { database_id: dbId },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      State: {
        rich_text: [
          {
            text: {
              content: state,
            },
          },
        ],
      },
      CreateDate: {
        rich_text: [
          {
            text: {
              content: createDate,
            },
          },
        ],
      },
      IssueID: {
        rich_text: [
          {
            text: {
              content: id,
            },
          },
        ],
      },
    },
  };
};

module.exports = {
  createPayload,
  createPayload02,
  createPayload03,
  createPayload04,
};

// 노션 JSON 구조

const createPayload01 = (title, state, createDate, id, dbId) => {
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

const createPayload02 = (title, state) => {
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
      State: {
        rich_text: [
          {
            text: {
              content: state,
            },
          },
        ],
      },
    },
  };
};

module.exports = {
  createPayload01,
  createPayload02,
};

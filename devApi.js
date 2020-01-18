const got = require("got");
const removeMarkdown = require("remove-markdown");
const sentimentAnalysis = require("sentiment");
const textReadability = require("text-readability");
const emojis = require("./emojis");

// Written for DEV API beta v0.5.9
const API = "https://dev.to/api/articles";
const KEY = process.env.DEV_KEY;

// Take a DEV username and a WebSocket (ws) connection.
// Send updates of progress and finally the results,
// various textual statistics of a user's published articles
module.exports = (user, ws) => {
  // Get the plaintext content of user's published articles
  const getArticles = async user => {
    let articleIds = [];
    let pageCount = 0;
    while (true) {
      // Get a list of user's article ids
      const response = await got(`${API}?username=${user}&page=${pageCount}`, {
        "api-key": KEY
      });
      const body = JSON.parse(response.body);
      if (body.length === 0) break;
      articleIds = articleIds.concat(body.map(article => article.id));
      ws.send(
        JSON.stringify({
          msg: `Progress: got page no. ${pageCount +
            1} of article ids ${emojis.random()}`
        })
      );
      pageCount += 1;
    }

    // Get the article markdown of these ids
    let articles = [];
    let articleCount = 0;
    // TODO: Fix duplicate ids coming back from API
    articleIds = [...new Set(articleIds)].sort((a, b) => a - b); // sort old to new
    for (const id of articleIds) {
      articleCount += 1;
      const response = await got(`${API}/${id}`, {
        "api-key": KEY
      });
      ws.send(
        JSON.stringify({
          msg: `Progress: got text of article no. ${articleCount} ${emojis.random()}`
        })
      );
      articles.push(JSON.parse(response.body));
    }

    return articles.map(article => {
      return {
        title: article.title,
        text: removeMarkdown(article.body_markdown)
      };
    });
  };

  // Get text statistics for a list of plaintext
  const getStats = articles => {
    ws.send(JSON.stringify({ msg: `Progress: analyzing ${emojis.random()}` }));
    const analyze = new sentimentAnalysis().analyze;
    return articles.map(article => {
      return {
        title: article.title,
        readability: {
          fleschReadingEase: textReadability.fleschReadingEase(article.text),
          fleschKincaidGrade: textReadability.fleschKincaidGrade(article.text)
        },
        sentiment: analyze(article.text).comparative
      };
    });
  };

  getArticles(user)
    .then(articles =>
      ws.send(JSON.stringify({ msg: "", result: getStats(articles) }))
    )
    .catch(err => {
      console.error(err);
    });
};

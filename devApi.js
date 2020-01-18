const got = require("got");
const removeMarkdown = require("remove-markdown");
const sentimentAnalysis = require("sentiment");
const textReadability = require("text-readability");

// Written for DEV API beta v0.5.9
const API = "https://dev.to/api/articles";
const KEY = process.env.DEV_KEY;

// Pass a DEV username and a WebSocket (ws) connection.
// Send updates of progress and finally the results:
// Various text statistic of a user's published articles
module.exports = (user, ws) => {
  // Get the plaintext content of user's published articles
  const getArticles = async user => {
    let articleIds = [];
    let pageCount = 0;
    while (true) {
      // Get a list of user's article ids
      console.log(`${API}?username=${user}&page=${pageCount}`);
      const response = await got(`${API}?username=${user}&page=${pageCount}`, {
        "api-key": KEY
      });
      const body = JSON.parse(response.body);
      if (body.length === 0) break;
      articleIds = articleIds.concat(body.map(article => article.id));
      ws.send(
        JSON.stringify({ msg: `Got page no. ${pageCount + 1} of article ids` })
      );
      pageCount += 1;
    }

    // Get the article markdown of these ids
    let articles = [];
    let articleCount = 0;
    // TODO: Fix duplicate ids coming back from API
    articleIds = Array.from(new Set(articleIds));
    for (const id of articleIds) {
      articleCount += 1;
      const response = await got(`${API}/${id}`, {
        "api-key": KEY
      });
      ws.send(
        JSON.stringify({ msg: `Got text of article no. ${articleCount}` })
      );
      articles.push(JSON.parse(response.body).body_markdown);
    }

    return articles.map(article => removeMarkdown(article));
  };

  // Get text statistics for a list of plaintext
  const getStats = articles => {
    const analyze = new sentimentAnalysis().analyze;
    return articles.map(article => {
      return {
        readability: {
          fleschReadingEase: textReadability.fleschReadingEase(article),
          fleschKincaidGrade: textReadability.fleschKincaidGrade(article)
        },
        sentiment: analyze(article).comparative
      };
    });
  };

  getArticles(user)
    .then(articles => ws.send(JSON.stringify({ result: getStats(articles) })))
    .catch(err => console.error(err));
};

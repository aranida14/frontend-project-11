export default (rssXmlString) => {
  const domParser = new DOMParser();
  const xmlDocument = domParser.parseFromString(rssXmlString, 'text/xml');
  const channel = xmlDocument.querySelector('channel');
  // feed
  const feedTitle = channel.querySelector('title').textContent;
  const feedDescription = channel.querySelector('description').textContent;

  // posts
  const postsElements = channel.querySelectorAll('item');
  const posts = [...postsElements].map((postElement) => {
    const title = postElement.querySelector('title').textContent;
    const link = postElement.querySelector('link').textContent;
    const description = postElement.querySelector('description').textContent;
    const pubDate = postElement.querySelector('pubDate').textContent;
    return {
      title,
      link,
      description,
      pubDate,
    };
  });
  return {
    feedInfo: { title: feedTitle, description: feedDescription },
    posts,
  };
};

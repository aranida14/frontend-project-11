export default (rssXmlString) => {
  const domParser = new DOMParser();
  const xmlDocument = domParser.parseFromString(rssXmlString, 'text/xml');

  const errorNode = xmlDocument.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`Parse error: ${errorNode.textContent}`);
  }

  const channel = xmlDocument.querySelector('channel');
  // feed
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;

  // posts
  const itemsElements = channel.querySelectorAll('item');
  const items = [...itemsElements].map((postElement) => {
    const itemTitle = postElement.querySelector('title').textContent;
    const itemLink = postElement.querySelector('link').textContent;
    const itemDescription = postElement.querySelector('description').textContent;
    const itemPubDate = postElement.querySelector('pubDate').textContent;
    return {
      title: itemTitle,
      link: itemLink,
      description: itemDescription,
      pubDate: itemPubDate,
    };
  });
  return {
    title,
    description,
    items,
  };
};

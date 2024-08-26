/* eslint no-param-reassign: 0 */

export default (feedsContainer, feeds) => {
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');

  const titleContainer = document.createElement('div');
  titleContainer.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Фиды';
  titleContainer.append(cardTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  const feedsElements = feeds.map(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const titleElement = document.createElement('h3');
    titleElement.classList.add('h6', 'm-0');
    titleElement.textContent = title;

    const descriptionElement = document.createElement('p');
    descriptionElement.classList.add('m-0', 'small', 'text-black-50');
    descriptionElement.textContent = description;

    li.append(titleElement, descriptionElement);
    return li;
  });

  feedsList.append(...feedsElements);
  feedsCard.append(titleContainer, feedsList);

  feedsContainer.textContent = '';
  feedsContainer.append(feedsCard);
};

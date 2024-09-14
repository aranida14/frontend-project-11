/* eslint no-param-reassign: 0 */

export default (postsContainer, posts, watchedState) => {
  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');

  const titleContainer = document.createElement('div');
  titleContainer.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Посты';
  titleContainer.append(cardTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  const postsElements = posts.map(({ id, link, title }) => {
    const isViewed = watchedState.uiState.viewedPosts.includes(id);

    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', link);
    linkElement.setAttribute('data-id', id);
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('rel', 'noopener noreferrer');
    if (isViewed) {
      linkElement.classList.add('fw-normal', 'link-secondary');
    } else {
      linkElement.classList.add('fw-bold');
    }
    linkElement.textContent = title;

    linkElement.addEventListener('click', () => {
      if (!watchedState.uiState.viewedPosts.includes(id)) {
        watchedState.uiState.viewedPosts.push(id);
      }
    });

    const buttonElement = document.createElement('button');
    buttonElement.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonElement.setAttribute('data-id', id);
    buttonElement.setAttribute('type', 'button');
    buttonElement.setAttribute('data-bs-toggle', 'modal');
    buttonElement.setAttribute('data-bs-target', '#modal');
    buttonElement.textContent = 'Просмотр';

    buttonElement.addEventListener('click', () => {
      watchedState.currentPost = id;
      if (!watchedState.uiState.viewedPosts.includes(id)) {
        watchedState.uiState.viewedPosts.push(id);
      }
    });

    li.append(linkElement, buttonElement);
    return li;
  });

  postsList.append(...postsElements);
  postsCard.append(titleContainer, postsList);

  postsContainer.textContent = '';
  postsContainer.append(postsCard);
};

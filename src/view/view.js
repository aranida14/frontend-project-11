import onChange from 'on-change';
import renderFeeds from './renderFeeds.js';
import renderPosts from './renderPosts.js';

export default (elements, t, state) => {
  const {
    form,
    input,
    inputFeedback,
    submitButton,
    feedsContainer,
    postsContainer,
    modalTitle,
    modalBody,
    modalDetailsButton,
  } = elements;
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.isValid':
        if (value) {
          input.classList.remove('is-invalid');
        } else {
          input.classList.add('is-invalid');
        }
        break;
      case 'feeds':
        renderFeeds(feedsContainer, value);
        break;
      case 'posts':
        renderPosts(postsContainer, value, watchedState);
        break;
      case 'form.status':
        if (value === 'processing') {
          submitButton.setAttribute('disabled', '');
          input.setAttribute('disabled', '');
          inputFeedback.textContent = '';
        } else {
          submitButton.removeAttribute('disabled');
          input.removeAttribute('disabled');
          input.focus();
        }
        if (value === 'success') {
          inputFeedback.textContent = t('feedback.success');
          inputFeedback.classList.add('text-success');
          inputFeedback.classList.remove('text-danger');
          form.reset();
        }
        if (value === 'failure') {
          inputFeedback.classList.remove('text-success');
          inputFeedback.classList.add('text-danger');
          const { errors } = watchedState.form;
          if (errors.url) {
            const { key, values } = errors.url;
            inputFeedback.textContent = t(key, values);
          } else if (errors.networkError) {
            inputFeedback.textContent = t('feedback.networkError');
          } else if (errors.invalidRss) {
            inputFeedback.textContent = t('feedback.invalidRss');
          }
        }
        break;
      case 'currentPost':
        if (value) {
          const currentPost = watchedState.posts.find((post) => post.id === value);
          if (currentPost) {
            modalTitle.textContent = currentPost.title;
            modalBody.textContent = currentPost.description;
            modalDetailsButton.href = currentPost.link;
          }
        }
        break;
      case 'uiState.viewedPosts':
        renderPosts(postsContainer, watchedState.posts, watchedState);
        break;
      default:
        break;
    }
  });

  return watchedState;
};

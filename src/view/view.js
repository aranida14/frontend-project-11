import onChange from 'on-change';
import { isEmpty } from 'lodash';
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
      case 'form.errors':
        if (!isEmpty(value)) {
          inputFeedback.classList.remove('text-success');
          inputFeedback.classList.add('text-danger');
          if (value.url) {
            const { key, values } = value.url;
            inputFeedback.textContent = t(key, values);
          } else if (value.networkError) {
            inputFeedback.textContent = t('feedback.networkError');
          } else if (value.invalidRss) {
            inputFeedback.textContent = t('feedback.invalidRss');
          } else if (isEmpty(value)) {
            inputFeedback.textContent = '';
          }
        }
        break;
      case 'feeds':
        form.reset();
        input.focus();
        renderFeeds(feedsContainer, value);
        break;
      case 'posts':
        renderPosts(postsContainer, value, watchedState);
        break;
      case 'form.status':
        if (value === 'processing') {
          submitButton.setAttribute('disabled', '');
          input.setAttribute('disabled', '');
        } else {
          submitButton.removeAttribute('disabled');
          input.removeAttribute('disabled');
        }
        if (value === 'success') {
          inputFeedback.textContent = t('feedback.success');
          inputFeedback.classList.add('text-success');
          inputFeedback.classList.remove('text-danger');
        } // else if (value === 'error') {

        // }
        break;
      case 'currentPost':
        if (value) {
          const currentPost = watchedState.posts.find((post) => post.id === value);
          if (currentPost) {
            modalTitle.textContent = currentPost.title;
            modalBody.textContent = currentPost.description;
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

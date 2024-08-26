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
  } = elements;
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.isValid':
        if (value) {
          input.classList.remove('is-invalid');
        } else {
          input.classList.add('is-invalid');
          inputFeedback.classList.remove('text-success');
          inputFeedback.classList.add('text-danger');
        }
        break;
      case 'form.errors':
        if (!isEmpty(value)) {
          const { key, values } = value.url;
          inputFeedback.textContent = t(key, values);
        } else {
          inputFeedback.textContent = '';
        }
        break;
      case 'feeds':
        // console.log(Object.keys(watchedState.feeds));
        form.reset();
        input.focus();
        renderFeeds(feedsContainer, value);
        break;
      case 'posts':
        renderPosts(postsContainer, value);
        break;
      case 'form.status':
        if (value === 'processing') {
          submitButton.setAttribute('disabled', '');
        } else {
          submitButton.removeAttribute('disabled');
        }
        if (value === 'success') {
          inputFeedback.textContent = t('feedback.success');
          inputFeedback.classList.add('text-success');
          inputFeedback.classList.remove('text-danger');
        }
        break;
      default:
        break;
    }
  });

  return watchedState;
};

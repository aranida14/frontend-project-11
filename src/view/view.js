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
        }
        break;
      case 'form.errors':
        // console.log('form.errors value:');
        // console.log(value);
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
      default:
        break;
    }
  });

  return watchedState;
};

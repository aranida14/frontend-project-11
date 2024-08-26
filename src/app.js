import * as yup from 'yup';
import { isEmpty, uniqueId } from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import watch from './view/view.js';
import { feeds, posts } from './data.js';

export default () => {
  const defaultLang = 'ru';

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type=submit]'),
    inputFeedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const initialState = {
    form: {
      status: 'filling', // processing | success
      isValid: true,
      errors: {},
    },
    feeds: [], // { id: string, title: string, description: string, link: url }
    posts: [], // { id: string, title: string, link: url, pubDate: number, description: string }
  };

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'feedback.rssAlreadyExists' }),
    },
    string: {
      url: () => ({ key: 'feedback.invalidUrl' }),
    },
  });

  const buildSchema = (feedsLinks) => yup.object({
    url: yup
      .string()
      .trim()
      .required()
      .url()
      .notOneOf(feedsLinks), // .notOneOf(['https://lorem-rss.hexlet.app/feed']), , 'RSS already exists'
  });

  const validate = (fields, schema) => {
    const promise = schema.validate(fields, { abortEarly: false })
      .then(() => {})
      .catch((error) => {
        const errors = error.inner.reduce(
          (acc, errorItem) => ({ ...acc, [errorItem.path]: errorItem.message }),
          {},
        );
        return errors;
      });
    return promise;
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  }).then((t) => {
    const watchedState = watch(elements, t, initialState);
    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      watchedState.form.status = 'processing';
      const formData = new FormData(event.target);
      const url = formData.get('url');
      const schema = buildSchema(watchedState.feeds.map(({ link }) => link));
      validate({ url }, schema)
        .then((errors) => {
          if (!isEmpty(errors)) {
            watchedState.form.errors = errors;
            watchedState.form.isValid = false;
            watchedState.form.status = 'filling';
          } else {
            watchedState.form.isValid = true;
            watchedState.form.errors = {};
            watchedState.form.status = 'success';
            const trimmedUrl = url.trim();
            watchedState.feeds = [
              ...watchedState.feeds,
              {
                id: uniqueId(),
                link: trimmedUrl,
                title: feeds[0].title,
                description: feeds[0].description,
              },
            ];
            watchedState.posts = [
              ...watchedState.posts,
              {
                id: uniqueId(),
                title: posts[0].title,
                link: posts[0].link,
              },
            ];
          }
        });
    });
  });
};

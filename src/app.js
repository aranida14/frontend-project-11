import * as yup from 'yup';
import axios from 'axios';
import { isEmpty, uniqueId } from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import watch from './view/view.js';
// import { feeds, posts } from './data.js';
import parser from './parser.js';

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
      const formData = new FormData(event.target);
      const url = formData.get('url');
      const schema = buildSchema(watchedState.feeds.map(({ link }) => link));

      watchedState.form.status = 'processing';
      validate({ url }, schema)
        .then((errors) => {
          // console.log({errors});
          if (!isEmpty(errors)) {
            watchedState.form.errors = errors;
            watchedState.form.isValid = false;
            watchedState.form.status = 'filling';
          } else {
            watchedState.form.isValid = true;
            watchedState.form.errors = {};

            const trimmedUrl = url.trim();
            axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(trimmedUrl)}`)
              .then((response) => {
                // console.log('response:');
                // console.log(response);
                // console.log(response.data);
                // console.log(response.status);
                if (response.status === 200) {
                  return response.data;
                }
                throw new Error('Network error');
              })
              .then(({ contents }) => {
                // console.log('contents');
                // console.log(contents);
                try {
                  const feedData = parser(contents);
                  return feedData;
                } catch (error) {
                  throw new Error('Invalid RSS');
                }
              })
              .then((feedData) => {
                watchedState.form.status = 'success';
                // console.log({ feedData });
                watchedState.feeds = [
                  {
                    id: uniqueId(),
                    link: trimmedUrl,
                    title: feedData.feedInfo.title,
                    description: feedData.feedInfo.description,
                  },
                  ...watchedState.feeds,
                ];
                const posts = feedData.posts.map(({
                  title,
                  link,
                  description,
                  pubDate,
                }) => ({
                  id: uniqueId(),
                  title,
                  link,
                  pubDate,
                  description,
                }));
                watchedState.posts = [
                  ...posts,
                  ...watchedState.posts,
                ];
              })
              .catch((error) => {
                console.log(error);
                watchedState.form.status = 'filling';

                if (error.toString().includes('Network error')) {
                  watchedState.form.errors = { networkError: error };
                } else if (error.toString().includes('Invalid RSS')) {
                  watchedState.form.errors = { invalidRss: error };
                }
              });
          }
        });
    });
  });
};

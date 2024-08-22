import * as yup from 'yup';
import { isEmpty } from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';

export default () => {
  const defaultLang = 'ru';

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type=submit]'),
    inputFeedback: document.querySelector('.feedback'),
  };

  const initialState = {
    form: {
      status: 'filling', // processing | success
      isValid: true,
      errors: {},
    },
    feeds: {},
  };

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'feedback.rssAlreadyExists' }),
    },
    string: {
      url: () => ({ key: 'feedback.invalidUrl' }),
    },
  });

  const buildSchema = (feeds) => yup.object({
    url: yup
      .string()
      .trim()
      .required()
      .url()
      .notOneOf(feeds), // .notOneOf(['https://lorem-rss.hexlet.app/feed']), , 'RSS already exists'
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
      const schema = buildSchema(Object.keys(watchedState.feeds));
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
            watchedState.feeds = { ...watchedState.feeds, [trimmedUrl]: { url: trimmedUrl } };
          }
        });
    });
  });
};

import onChange from 'on-change';
import * as yup from 'yup';
import { isEmpty } from 'lodash';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type=submit]'),
    inputFeedback: document.querySelector('.feedback'),
  };

  const initialState = {
    isValid: true,
    errors: {},
    feeds: {},
  };

  const state = onChange(initialState, (path, value) => {
    switch (path) {
      case 'isValid':
        if (value) {
          elements.input.classList.remove('is-invalid');
        } else {
          elements.input.classList.add('is-invalid');
        }
        break;
      case 'errors':
        if (!isEmpty(value)) {
          elements.inputFeedback.textContent = value.url;
        } else {
          elements.inputFeedback.textContent = '';
        }
        break;
      case 'feeds':
        console.log(Object.keys(state.feeds));
        elements.form.reset();
        elements.input.focus();
        break;
      default:
        break;
    }
  });

  const buildSchema = (feeds) => yup.object({
    url: yup
      .string()
      .trim()
      .required()
      .url()
      .notOneOf(feeds, 'RSS already exists'), // .notOneOf(['https://lorem-rss.hexlet.app/feed']),
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

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url');
    const schema = buildSchema(Object.keys(state.feeds));
    validate({ url }, schema)
      .then((errors) => {
        if (!isEmpty(errors)) {
          // console.log('has errors')
          // console.log(errors);
          state.errors = errors;
          state.isValid = false;
        } else {
          // console.log('no errors')
          state.isValid = true;
          state.errors = {};
          state.feeds = { ...state.feeds, [url]: { url } };
        }
      });
  });
};

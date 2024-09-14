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
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
  };

  const initialState = {
    form: {
      status: 'filling', // processing | success
      isValid: true,
      errors: {},
    },
    currentPost: null, // post id
    uiState: {
      viewedPosts: [], // post ids
    },
    // { id: string, title: string, description: string, link: url }
    feeds: [],
    // { id: string, feedId: string, title: string, link: url, pubDate: number, description: string}
    posts: [],
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
                const feedId = uniqueId();
                watchedState.feeds = [
                  {
                    id: feedId,
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
                  feedId,
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

    // раз в 5 секунд проверять фиды на наличие новых постов
    setTimeout(function updateFeeds() {
      const promises = watchedState.feeds.map((feed) => axios
        .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.link)}`)
        .then((response) => {
          if (response.status === 200) {
            return response.data;
          }
          throw new Error('Network error');
        })
        .then(({ contents }) => {
          try {
            const feedData = parser(contents);
            return feedData;
          } catch (error) {
            throw new Error('Invalid RSS');
          }
        })
        .then((feedData) => {
          const newPosts = feedData.posts
            .filter((newPost) => {
              const oldPost = watchedState.posts.find((post) => (
                post.feedId === feed.id
                && post.pubDate === newPost.pubDate
              ));
              // if (oldPost === undefined) {
              //   console.log(`add new post ${JSON.stringify(newPost)}`);
              // }
              return oldPost === undefined;
            })
            .map((post) => ({
              id: uniqueId(),
              feedId: feed.id,
              title: post.title,
              link: post.link,
              pubDate: post.pubDate,
              description: post.description,
            }));

          watchedState.posts = [
            ...newPosts,
            ...watchedState.posts,
          ];
        })
        .catch((error) => {
          console.log(error);
        }));

      Promise.all(promises)
        .then(() => setTimeout(updateFeeds, 5000));
    }, 5000);
  });
};

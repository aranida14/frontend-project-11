import axios from 'axios';

const proxyRequest = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);

  return axios.get(proxyUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Network error');
    });
};

export default proxyRequest;

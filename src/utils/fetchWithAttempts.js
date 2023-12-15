import extractDomainWithProtocol from './extractDomainWithProtocol';
import sleep from './sleep';

const postponeRequestTime = {};

const fetchWithAttempts = async ({
  url,
  options = {},
  retries = 1,
  ignoreHttpErrorStatuses = [],
}) => {
  try {
    const domain = extractDomainWithProtocol(url);
    const res = await fetch(url, options);
    if (res.ok) {
      postponeRequestTime[domain] = 0;
      const json = await res.json();
      return json;
    }

    if (ignoreHttpErrorStatuses.includes(res.status)) {
      console.log(`Ignore HTTP error status ${res.status}`);

      const json = await res.json();
      console.log(json);

      return {
        code: 'ignore_http_status',
        status: res.status,
      };
    }
    
    if (res.status === 500) {
      const json = await res.json();
      console.log(`Internal server error`);
      console.log(JSON.stringify(json.error, null, 2));
      postponeRequestTime[domain] = (postponeRequestTime[domain] || 500) * 2;
      console.log(`Wait ${postponeRequestTime[domain]}ms befor making another ${domain} request`);
      await sleep(postponeRequestTime[domain]);
    }
    
    console.log(`Loading error, attempts left ${retries - 1}`);
    if (retries > 0) {
      return fetchWithAttempts({
        url,
        options,
        retries: retries - 1,
        ignoreHttpErrorStatuses,
      });
    }
  } catch (err) {
    console.log(err);

    console.log(`Loading error, attempts left ${retries - 1}`);
    if (retries > 0) {
      return fetchWithAttempts({
        url,
        options,
        retries: retries - 1,
        ignoreHttpErrorStatuses,
      });
    }
  }
};

export default fetchWithAttempts;
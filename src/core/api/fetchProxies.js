const fetchProxies = async () => {
    const res = await fetch('https://www.alohaeos.com/vote/proxy/waxmain?output=json', {});
    if (res.ok) {
      const json = await res.json();
      console.log(json);
      return json.proxies;
    }
    
    return [];
};

export default fetchProxies;
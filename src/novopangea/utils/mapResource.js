const mapResource = (resource) => ({
    value: Number(resource.split(' ')[0]),
    symbol: resource.split(' ')[1],
});

export default mapResource;
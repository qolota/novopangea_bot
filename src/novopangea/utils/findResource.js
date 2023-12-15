const findResource = ({
    resources,
    symbol,
}) => {
    return resources.find(b => b.symbol === symbol);
};

export default findResource;
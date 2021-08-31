const groupBy = function(data, key) {
    return data.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

module.exports = {
    groupBy
}
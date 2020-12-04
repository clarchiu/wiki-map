const round = function(num, decimals) {
  const dec = 10 ** decimals;
  return Math.round(num * dec) / dec;
};

const escape = function (str) {
  let div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

const sendRequest = function(method, url, data = undefined) {
  return $.ajax({ method: method, data: data, url: url });
}

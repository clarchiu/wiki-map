const round = function(num, decimals) {
  const dec = 10 ** decimals;
  return Math.round(num * dec) / dec;
};

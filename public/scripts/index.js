$(function() {
  const loadMaps = loadMapsData('/maps/json');
  const checkLoggedIn = checkUserLoggedIn();

  const getUserFavs = checkLoggedIn
    .then(loggedIn => {
      if (loggedIn) return getUserFavorites();
      return {};
    });

  Promise.all([checkLoggedIn, getUserFavs, loadMaps])
    .then(([isLoggedIn, userFav, maps]) => {
      renderRequest($('#all-maps'), maps, isLoggedIn, userFav);
    });
});

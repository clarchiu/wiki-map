$( function() {
  const checkLoggedIn = checkUserLoggedIn();
  const loadFavorites = loadMapsData(window.location.pathname + '/favorites');
  const loadContributions = loadMapsData(window.location.pathname + '/contributions');

  const getUserFavs = checkLoggedIn
    .then(loggedIn => {
      if (loggedIn) return getUserFavorites();
      return {};
    });

  Promise.all([loadFavorites, loadContributions, checkLoggedIn, getUserFavs])
    .then(([favorites, contributions, isLoggedIn, userFav]) => {
      renderRequest($('#favorites'), favorites, isLoggedIn, userFav);
      renderRequest($('#contributions'), contributions, isLoggedIn, userFav);
    });
});

$( function() {
  const checkLoggedIn = checkUserLoggedIn();
  const loadFavorites = loadMapsData(window.location.pathname + '/favorites');
  const loadContributions = loadMapsData(window.location.pathname + '/contributions');

  const getMyFavMaps = checkLoggedIn
    .then(loggedIn => {
      if (loggedIn) return getMyFavoriteMaps();
      return {};
    });

  Promise.all([loadFavorites, loadContributions, checkLoggedIn, getMyFavMaps])
    .then(([favorites, contributions, isLoggedIn, myFavs]) => {
      renderMaps($('#favorites'), favorites, isLoggedIn, myFavs);
      renderMaps($('#contributions'), contributions, isLoggedIn, myFavs);
    });
});

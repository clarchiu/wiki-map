$(function() {
  const loadMaps = loadMapsData('/maps/json');
  const checkLoggedIn = checkUserLoggedIn();

  const getMyFavMaps = checkLoggedIn
    .then(loggedIn => {
      if (loggedIn) return getMyFavoriteMaps();
      return {};
    });

  Promise.all([checkLoggedIn, getMyFavMaps, loadMaps])
    .then(([isLoggedIn, myFavs, maps]) => {
      renderMaps($('#all-maps'), maps, isLoggedIn, myFavs);
    });
});

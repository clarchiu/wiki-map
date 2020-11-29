$( function() {

  /** favorites a specific element, and updates their status to the database using
   * its mid and the current user's login cookie.
   *
   * @param {*} $target the element to change
   * @param {*} mid the map's id
   * @returns a promise, containing either an error or undefined
   */
  const favorite = function($target, url) {
    return $.ajax({
      method: 'post',
      url: url,
    })
    .then(res => {
      console.log(res.favorited); // debugging line
      if (res.favorited) {
        $target.removeClass('unfavorited').addClass('favorited');
      } else {
        $target.removeClass('favorited').addClass('unfavorited');
      }
    })
    .catch(err => {
      return createError(err.message);
    });
  };

  $('.maps').on('submit', (event) => {
    event.preventDefault();

    const $favBtn = $(event.target);
    const url = $favBtn.attr('action');
    $favBtn.addClass('loading');

    favorite($favBtn, url)
      .then(() => $favBtn.removeClass('loading'));
  });

});

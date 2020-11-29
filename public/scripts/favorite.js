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

    const $form = $(event.target);
    const url = $form.attr('action');

    if (!url) return $form.insertBefore(createError('url not found'));

    $form.addClass('loading');

    favorite($form, url)
      .then(() => $form.removeClass('loading'));
  });

});

$( function() {

  /** favorites a specific element, and updates their status to the database using
   * its mid and the current user's login cookie.
   *
   * @param {*} $target the element to change
   * @param {*} mid the map's id
   * @returns a promise, containing either an error or undefined
   */
  const favorite = function($target, url) {
    console.log(url);
    return $.ajax({
      method: 'post',
      url: url,
    })
    .then(res => {
      if (res.favorited) {
        $target.removeClass('unfavorited').addClass('favorited');
        return;
      }
      $target.removeClass('favorited').addClass('unfavorited');
    });
  };

  $('.maps').on('click', '[data-action]', function(e) {
    const $span = $(this);
    const url = $span.attr('data-action');

    if (!url) return $span.insertBefore(createError('url not found'));

    $span.addClass('loading');

    favorite($span, url)
      .then(() => $span.removeClass('loading'))
      .catch(err => $span.after(createError(err.responseJSON.msg)));
  });
});

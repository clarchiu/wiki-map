/** creates an error message element. Does not check for XXS as
 * this function is a helper function for devs and will only ever display on
 * a local client's page.
 *
 * @param {*} msg a string used as the error message
 */
const createError = function(msg) {
  const $err = $(`
  <div class="err">
    <span><i class="fas fa-exclamation-circle"></i></span>
    <span>${msg}</span>
  </div>
  `);
  $err.on('click', () => {
    $err.slideDown(200,function() {
      $err.remove();
    });
  });
  return $err;
}

/** favorites a specific element, and updates their status to the database using
 * its mid and the current user's login cookie.
 *
 * @param {*} $target the element to change
 * @param {*} mid the map's id
 * @returns a promise, containing either an error or undefined
 */
const favorite = function($target, mid) {
  if (!mid) {
  return Promise.resolve(createError('Please log in to favorite a map'));
  }
  return $.ajax({
    method: 'post',
    url: `/users/${mid}/favorite`,
  })
  .then(res => {
    console.log(res.favorited); // debugging line
    if (res.favorited) {
      $target.addClass('favorited');
    } else {
      $target.addClass('unfavorited');
    }
  })
  .catch(err => {
    return createError(err.message);
  });
};

$(() => {
  const favorite = function($target, uid, mid) {
    if (!uid || !mid) {
     return Promise.resolve(createError('Please log in to favorite a map'));
    }
    return $.ajax({
      method: 'post',
      route: `users/${uid}/favorite?id=${mid}`,
    })
    .then(res => {
      console.log(res.favorited);
      if (res.favorited) {
        $target.addClass('favorited');
      } else {
        $target.addClass('unfavorited');
      }
    })
    .catch(err => {
      return createError(err.message);
    });
  }
});

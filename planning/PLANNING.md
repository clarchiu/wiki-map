# Page Structure
## header.ejs
  * Navigation bar, used to traverse the website for creating maps, switching to the user profile, or even searching for maps (STRETCH)
## index.ejs  ( /maps )
* Contain all maps, to which the viewer can scroll through and click on at their leisure. A logged in user can switch from all maps to their own favorited or contributed maps.
## map.ejs ( /maps/:map_id )
* Contains an individual map, with all of it’s pins and data
* Edit the map (add/edit/remove pins)
## user.ejs ( /users/:user_id )
* Information on a specific user. Undecided whether this should be private or not
## map_form.ejs ( /maps/new )
* Form for creating a new map. Only authorized users can use this form
## error.ejs 
* Error page that shows up with a miscellaneous error

# Routes

## /maps
### GET /maps
* index
* show all maps
* STRETCH
  * show maps based on location
### GET /maps/new
* If a user is authenticated
  * maps_form
  * creating new map
  * makes request to POST /maps
* If a user is not authenticated
  * show relevant html
  * redirect to /maps
### GET /maps/:map_id
* gets an individual map, with all of it’s pins and data
* If a user is authenticated
  * shows add/edit/removed pin functions
### POST /maps
* If a user is authenticated
  * adds map to database
  * redirects to /maps/:map_id
* If a user is not authenticated
  * show relevant html
  * redirect to /maps
### POST /maps/:map_id
* updates map with id
* adds pin to db
### POST /maps/:map_id/:pin_id
* If user is authenticated and owns the pin
  * edits pin on db
* If user is authenticated and does not own the pin
  * show error box
* If user is not authenticated
  * show relevant error html
### POST /maps/:map_id/:pin_id/delete
* If user is authenticated and owns the pin
  * deletes pin
* If user is authenticated and does not own the pin
  * show error box
* If user is not authenticated
  * show relevant error html

## /users
### GET /users/:user_id
* Show user favorites and contributions
### POST /user/:map_id/favorites
* Add/remove a favorited map, based on if it is already favorited or not. (only if authorized)

## users/login
### POST /login/:user_id
* Logs into user_id’s account

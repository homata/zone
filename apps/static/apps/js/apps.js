// Access Token
mapboxgl.accessToken = mapbox_access_token;

// Map Style
var map = new mapboxgl.Map({
//  style: 'mapbox://styles/mapbox/streets-v11', // 英語
  style: 'mapbox://styles/homata/ckef4dr910c4e19nsr93kayh6',
  container: "map",
  center: [139.796476,35.654716],
  zoom: 10
});

// Map Data Load
//map.on('load', function () {
//});

// show control
map.addControl(new mapboxgl.NavigationControl());

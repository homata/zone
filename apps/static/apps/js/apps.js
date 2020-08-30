// Access Token
mapboxgl.accessToken = mapbox_access_token;

// Map Style
var map = new mapboxgl.Map({
//  style: 'mapbox://styles/mapbox/streets-v11', // 英語
  style: 'mapbox://styles/homata/ckef4dr910c4e19nsr93kayh6',
  container: "map",
  center: [139.796476,35.654716],  // 豊洲駅
  zoom: 10
});

// show control
map.addControl(new mapboxgl.NavigationControl());

// Map Data Load

// area GeoJSON Load
map.on('load', function(){
    map.addSource('population', {
        type: 'geojson',
        data: '/static/apps/data/szone.geojson'
    });

    map.addLayer({
        'id': 'population',
        'type': 'fill',
        'source': 'population',
        'paint': {
            'fill-color': '#888888',
            'fill-opacity': 0.4,
            'fill-outline-color': '#555555'
        },
        //'filter': ['==', '$type', 'Polygon']
    })
})

map.on('load', function() {
    // アイコン画像設定
    map.loadImage('/static/apps/images/marker.png', function (error, res) {
        map.addImage('sample', res);
    });

    // GeoJSON Load
    var lon = 139.796476;
    var lat = 35.654716;

    $.getJSON('/api/v1.0/place/spots/', {lon: lon, lat: lat}, function (data) {
        // アイコン設定
        map.addSource('symbol_sample', {
            type: 'geojson',
            data: data
        });

        // スタイル設定
        map.addLayer({
            "id": "symbol_sample",
            "type": "symbol",
            "source": "symbol_sample",
            "layout": {
                "icon-image": "sample",
                "icon-allow-overlap": true,
                "icon-size": 0.05,
                'text-field': ['get', 'name'],
                //'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 0.9],
                'text-anchor': 'top',
                //"text-size": 14
            },
            "paint": {}
        });
    });

    // アイコンクリックイベント
    map.on('click', "symbol_sample", function (e) {
        var coordinates = e.lngLat;

        // 属性設定
        var description = e.features[0].properties.message;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    //カーソルON,OFF
    map.on('mouseenter', "symbol_sample", function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', "symbol_sample", function () {
        map.getCanvas().style.cursor = '';
    });
});


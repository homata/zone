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

// show control
map.addControl(new mapboxgl.NavigationControl());

// Map Data Load
/*map.on('load', function () {
    // GeoJSON Load
    map.addSource('nagano_hotel', {
        type: 'geojson',
        data: '/static/apps/js/nagano.geojson'
    });

    // setting style
    var point_list = [
        [ "nagano_hotel", "#FF0000", 'ホテル' ],
        [ "japanese_inn", "#00FF00", '旅館'   ],
        [ "venue",        "#0000FF", '施設'   ]
    ]

    // setting
    for (var ii=0; ii<point_list.length; ii++) {
        var point_id    = point_list[ii][0];
        var point_color = point_list[ii][1];
        var point_category = point_list[ii][2];

        map.addLayer({
            "id": point_id,
            "type": "circle",
            "source": "nagano_hotel",
            "layout": {},
            "paint": {
                'circle-color': point_color,
                'circle-radius': 6,
                'circle-opacity': 0.8,
                'circle-stroke-color': '#444444',
                'circle-stroke-width': 1
            },
            'filter': ['==', 'category', point_category]
        });

        map.on('click', point_id, function (e) {
            var coordinates = e.lngLat;

            // 属性設定
            var description =
                '名前: ' + e.features[0].properties.name + '<br>' +
                /!*'Name: ' + e.features[0].properties.name_e + '<br>' + *!/
                '住所: ' + e.features[0].properties.address + '<br>' +
                '電話番号(TEL): ' + e.features[0].properties.tel;
            var url = e.features[0].properties.url;
            if (url != null && url != "null") {
                description += '<br>URL: ' + "<a href=\"" + url + "\">" + url + "</a>";
            }
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });
        // カーソルON,OFF
        map.on('mouseenter', point_id, function () {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', point_id, function () {
            map.getCanvas().style.cursor = '';
        });
    }

});*/



/*
 map.on('load', function(){
    const lngLats = [
      [ 139.7029507, 35.657829 ],
      [ 139.7107544, 35.6462484 ],
      [ 139.7162516, 35.6343683 ],
      [ 139.7237285, 35.6262489 ],
      [ 139.7283931, 35.6198556 ],
      [ 139.7388572, 35.6299566 ],
    ]
    map.addLayer({
      'id': 'route',
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': lngLats,
          }
        }
      },
      'paint': {
        'line-color': '#0c7',
        'line-width': 2,
      }
    })
  })
 */

map.on('load', function(){
    // GeoJSON Load
    map.addSource('population', {
        type: 'geojson',
        data: '/static/apps/js/H30_szone.geojson'
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
    map.loadImage('/static/apps/images/Map-Marker-PNG-File.png', function (error, res) {
        map.addImage('sample', res);
    });

    // アイコン設定
    map.addSource('symbol_sample', {
        type: 'geojson',
        data: {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [139.796476,35.654716]
            },
            'properties': {
                'title': '豊洲駅',
            }
        }
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
           'text-field': ['get', 'title'],
           //'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
           'text-offset': [0, 0.9],
           'text-anchor': 'top',
           //"text-size": 14
        },
        "paint": {}
    });
});

/*
map.on('load', function() {
    map.addLayer({
        'id': 'points',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates':[139.796476,35.654716]
                        },
                        'properties': {
                            'title': '豊洲駅',
                            'icon': 'marker'
                        }
                    }
                ]
            }
        },
        "paint": {
            'circle-color': "#FF0000",
            'circle-radius': 6,
            'circle-opacity': 0.8,
            'circle-stroke-color': '#444444',
            'circle-stroke-width': 1
        },
    });
});*/

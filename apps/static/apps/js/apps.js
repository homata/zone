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

// // area GeoJSON Load
// // 2050年の人口から10段階のカテゴリ別に分類するためのフィルタ
// let population_1 = ["<", ["get", "population"], 1000];
// let population_2 = ["all", [">=", ["get", "population"],    1000], ["<", ["get", "population"],    5000]];
// let population_3 = ["all", [">=", ["get", "population"],    5000], ["<", ["get", "population"],    7000]];
// let population_4 = ["all", [">=", ["get", "population"],    7000], ["<", ["get", "population"],   10000]];
// let population_5 = ["all", [">=", ["get", "population"],   10000], ["<", ["get", "population"],   20000]];
// let population_6 = ["all", [">=", ["get", "population"],   20000], ["<", ["get", "population"],   50000]];
// let population_7 = ["all", [">=", ["get", "population"],   50000], ["<", ["get", "population"],   70000]];
// let population_8 = ["all", [">=", ["get", "population"],   70000], ["<", ["get", "population"],  100000]];
// let population_9 = ["all", [">=", ["get", "population"],  100000], ["<", ["get", "population"],  150000]];
// let population_10 = ["<", ["get", "population"], 200000];






// // 色の設定
 let colors2 = ['rgb(215, 25, 28)',   'rgb(232, 91, 58)',
               'rgb(249, 158, 89)',  'rgb(254, 201, 128)',
               'rgb(255, 237, 170)', 'rgb(237, 247, 201)',
               'rgb(199, 230, 219)', 'rgb(157, 207, 228)',
               'rgb(100, 165, 205)', 'rgb(44, 123, 182)']

map.on('load', function(){
    $.getJSON('/api/v1.0/area/szone/', function (data) {
       // https://github.com/morganherlocker/geocolor
        var z = 'population', numberOfBreaks = 10, colors = ['rgb(215, 25, 28)', 'rgb(157, 207, 228)', 'rgb(44, 124, 200)']
        var geo = geocolor.jenks(data, z, numberOfBreaks, colors)
        //console.log(geoJenks)

        var symbols = geo.legend.symbols;

        // 色の設定
        var colors = [];
        for (var ii=0; ii<numberOfBreaks; ii++) {
            var color = symbols[ii].color;
            colors.push(color);
        }
        let population_1 = ["<", ["get", "population"], symbols[0].to];
        let population_2 = ["all", [">=", ["get", "population"], symbols[1].from], ["<", ["get", "population"], symbols[1].to]];
        let population_3 = ["all", [">=", ["get", "population"], symbols[2].from], ["<", ["get", "population"], symbols[2].to]];
        let population_4 = ["all", [">=", ["get", "population"], symbols[3].from], ["<", ["get", "population"], symbols[3].to]];
        let population_5 = ["all", [">=", ["get", "population"], symbols[4].from], ["<", ["get", "population"], symbols[4].to]];
        let population_6 = ["all", [">=", ["get", "population"], symbols[5].from], ["<", ["get", "population"], symbols[5].to]];
        let population_7 = ["all", [">=", ["get", "population"], symbols[6].from], ["<", ["get", "population"], symbols[6].to]];
        let population_8 = ["all", [">=", ["get", "population"], symbols[7].from], ["<", ["get", "population"], symbols[7].to]];
        let population_9 = ["all", [">=", ["get", "population"], symbols[8].from], ["<", ["get", "population"], symbols[8].to]];
        let population_10 = ["<", ["get", "population"], symbols[9].to];

        map.addSource('population', {
            type: 'geojson',
            data: data
        });

        map.addLayer({
            'id': 'population',
            'type': 'fill',
            'source': 'population',
            'paint': {
                //'fill-color': '#888888',
                'fill-opacity': 0.3,
                //'fill-outline-color': '#555555',
                "fill-color":
                  ["case",
                    population_1, colors[9],
                    population_2, colors[8],
                    population_3, colors[7],
                    population_4, colors[6],
                    population_5, colors[5],
                    population_6, colors[4],
                    population_7, colors[3],
                    population_8, colors[2],
                    population_9, colors[1],
                    population_10, colors[0],
                    colors[0]
                  ],
                // "fill-outline-color": "white"
                "fill-outline-color": "#808080"
            },
            //'filter': ['==', '$type', 'Polygon']
        })
        // z-index moveLayer(id, beforeId)
        map.moveLayer('population', 'symbol_sample');
    });
})

// スポット
map.on('load', function() {
    // アイコン画像設定
    map.loadImage('/static/apps/images/marker_bw.png', function (error, res) {
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
                "icon-size": 0.08,
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


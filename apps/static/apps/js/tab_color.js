/**-----------------------------------------------------------
 * GeoColor選択ダイアログ
 **---------------------------------------------------------**/

jQuery(function($){
	// セレクトボックス初期値
	layer_auto_legend_color_enable();

	// セレクトボックス変更
	$("#layer_column").change(function() {
		layer_auto_legend_color_enable();
	}).change();

	$("#geocolor").dialog({
		autoOpen: false,  // 自動的に開かないように設定
		width: 400,       // 横幅のサイズを設定
		modal: true,      // モーダルダイアログにする
		buttons: {		  // ボタン名 : 処理 を設定
			"設定": function() {
				auto_layer_legend_color();
				$(this).dialog("close");
			},
			"キャンセル": function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			/*allFields.val( "" ).removeClass( "ui-state-error" );*/
		}
	});

	/*
	$('#spin').spinner({
		max: 10000,
		min: 100,
		step: 10,
		numberFormat: 'n',
		icons: {
			down: "ui-icon-arrow-1-s",
			up: "ui-icon-arrow-1-n"
		},
		change: function() {
			console.log(jQuery( "#spin" ).val() );
		}
	});
	*/
	
	// 中間色の有効/無効
	$('#color_middle_enable').change(function() {
		// チェックが入っていたら有効化
		if ( $(this).is(':checked') ){
			// ボタンを有効化
			$('#color_middle').prop('disabled', false);
		} else {
			// ボタンを無効化
			$('#color_middle').prop('disabled', true);
		}
	});

});

/**
 *	自動設定 有効/無効
 */
function layer_auto_legend_color_enable() {
	//「自動設定」ボタンを無効にする
	$(".auto_layer_legend_color").prop("disabled", true);

	// column name
	var selectCount = $('#layer_column').children('option').length;;
	if (selectCount == 0) {
		return;
	}

	// カラムデータ取得
	var layer_column = $('#layer_column :selected').val();

	// geojsonデータ取得
	var geojson    = tab_layer.geojson;
	var jsonReader = new OpenLayers.Format.GeoJSON();
	var features   = jsonReader.read(geojson);

	// 配列が数値データかチェック
	var length = features.length;
	if (length == 0) {
		return;
	}
	for (var ii=0; ii<length; ii++) {
		// number check
		var value = features[ii].attributes[layer_column];
		if (!isNumber(value)) {
			return;
		}
	}

	//「自動設定」ボタンを有効にする
	$(".auto_layer_legend_color").prop("disabled", false);
}

/**
 *	設定の自動設定
 *
 * Note: http://geocolor.io/
 */
function auto_layer_legend_color() {
	// 既存のリスト削除
	var count = $('[id^="legend_item_"]').length;
	for(var ii=count-1; ii>=0; ii--) {
		var item = '#legend_item_' + ii.toString(10);
		$(item).remove();
	}

	var classification = $('#classification').val();
	var breaks         = parseFloat($('#breaks').val());

	/*
	var color_start  = ($('#color_start option:selected').val());
	var color_middle = ($('#color_middle option:selected').val());
	var color_end    = ($('#color_end option:selected').val());
	*/
	var color_start  = ($('#color_start').val());
	var color_middle = ($('#color_middle').val());
	var color_end    = ($('#color_end').val());

	// geojsonデータ取得
	var geojson    = tab_layer.geojson;
	var jsonReader = new OpenLayers.Format.GeoJSON();
	var features   = jsonReader.read(geojson);

	// 対象カラム名取得
	var layer_column = $('#layer_column :selected').val();

	// 対象カラムの一次配列作成
	var length = features.length;
	var array = [];
	for (var ii=0; ii<length; ii++) {
		var value = features[ii].attributes[layer_column];
		array.push(value);
	}

	// 値が重複しているものを削除したリスト
	var array2 = array.filter(function (x, i, self) {
		return self.indexOf(x) === i;
	});

	//var number = Math.min(LEGEND.MAX, breaks);
	var colors = [];
	colors.push(color_start);
	if($("#color_middle_enable").prop('checked')) { // 中間色有効？
		colors.push(color_middle);
	}
	colors.push(color_end);
	var geo = null;

	var arlen = array2.length;
	var numberOfBreaks = Math.min(LEGEND.MAX, breaks);
	numberOfBreaks = Math.min(numberOfBreaks, arlen);

	//number = 5;
	//colors = ['green', 'yellow', 'red'];

	// Todo; 各分類の動作を再チェック
	if (classification === 'jenks') {				// jenks  自然分類 (Jenks)
		//var gg = JSON.stringify(geojson);
		//var g0 = JSON.parse(gg);
		geo = geocolor.jenks(geojson, layer_column, numberOfBreaks, colors)
	} else if(classification === 'quantiles') {		// quantiles 等量
		geo = geocolor.quantiles(geojson, layer_column, numberOfBreaks, colors)
	} else if(classification === 'equals') {		// equal intervals 等間隔
		geo = geocolor.equalIntervals(geojson, layer_column, numberOfBreaks, colors)
	} else {										// all (assigns the same style to all features)
		// ToDo: デフォルトの色が必要
		var style = {
			'stroke': DEFAULT_COLOR,
			'fill-opacity': .7,
			'fill': DEFAULT_COLOR
		}
		geo = geocolor.all(geojson, style)
	}

	/*
	 for (var ii=0; ii<clen; ii++) {
	 tab_layer.add_layer_legend_color();
	 var name = '#legend_name_' + (ii).toString(10);
	 var val  = array2[ii];
	 $(name).val(val);
	 }
	 */

	var symbols = geo.legend.symbols;
	//var title   = geo.legend.title;

	for (var ii=0; ii<numberOfBreaks; ii++) {
		var vcolor = symbols[ii].color;
		//var from   = symbols[ii].from;
		var to     = symbols[ii].to;

		$('#legend_color_input').before(
			$('<div id=legend_item_' + ii + '>').append(
				$('<input>').attr({type: "text", name: "lenegd_name[" + ii + "]", id: "legend_name_" + ii}),
				$('<input>').attr({type: "color", name: "legend_value[" + ii + "]", id: "legend_value_" + ii, list: "legend_color_list", value: vcolor, style:"width:25%"})
			)
		);

		var name = '#legend_name_' + (ii).toString(10);
		//var val  = from + "-" + to;
		var val  = to;
		$(name).val(val);
	}
}

/**
 * 凡例カラーリスト
 */
function getLegendColorList() {
	var legend_default_color = [];
	var obj = $('#legend_default_color').children();
	for (var ii=0; ii<obj.length; ii++) {
		var val = obj.eq(ii).val();
		legend_default_color.push(val);
	}
	return legend_default_color;
}

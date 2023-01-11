var raster;
var source;
var vector;
var map;
var features = new ol.Collection();
var format = new ol.format.WKT();
var selectedFeature;
var interaction;
var overlay;
var button;

var defaultColor = "#005baa"
var selectedColor = "#dc3545"
var drawColor = "#28a745"
var opacity = "80";

var drawOtion = {
	point: false,
	line: false,
	polygon: true,
};

var defaultWKT = 'POLYGON((-9.06034 39.174139999999994,-9.06717 39.17677999999998,-9.08577 39.173779999999994,-9.10745 39.167429999999996,-9.11668 39.17572999999999,-9.121590000000001 39.17412999999996,-9.12344 39.17739000000003,-9.122580000000001 39.178060000000016,-9.13301 39.18123,-9.13832 39.18709000000001,-9.143460000000001 39.18396999999999,-9.154490000000001 39.18364,-9.15653 39.18829000000002,-9.174570000000001 39.193509999999975,-9.17868 39.197779999999995,-9.17614 39.20058,-9.17824 39.21162000000001,-9.172 39.219689999999986,-9.17257 39.22158999999999,-9.164290000000001 39.222939999999994,-9.159650000000001 39.22183000000001,-9.15193 39.23371,-9.14362 39.22895,-9.1379 39.23451,-9.13592 39.24126000000001,-9.132520000000001 39.24162999999999,-9.13211 39.244820000000004,-9.126610000000001 39.24549000000002,-9.127170000000001 39.24843000000001,-9.124920000000001 39.24893,-9.122850000000001 39.251930000000016,-9.123850000000001 39.254310000000004,-9.12138 39.25695000000002,-9.12269 39.25914,-9.12064 39.260899999999964,-9.12317 39.262910000000005,-9.12209 39.26459000000003,-9.123190000000001 39.26874000000001,-9.11855 39.272729999999996,-9.115260000000001 39.27243999999999,-9.10861 39.27626000000001,-9.106100000000001 39.27896000000001,-9.10529 39.28504000000001,-9.10126 39.28982000000002,-9.09281 39.290299999999974,-9.09045 39.293510000000026,-9.08493 39.29514,-9.08507 39.29673,-9.07263 39.29961000000003,-9.07395 39.30233000000001,-9.06653 39.31012000000001,-9.063590000000001 39.30806999999999,-9.060160000000002 39.30868000000001,-9.05596 39.312039999999996,-9.0508 39.31043,-9.045720000000001 39.311649999999986,-9.03923 39.31054000000003,-9.03072 39.303589999999986,-9.02626 39.293440000000004,-9.026710000000001 39.29301000000001,-9.015410000000001 39.29409000000001,-9.01056 39.29182,-9.00394 39.29147999999998,-8.99666 39.29704000000004,-8.99263 39.29675,-8.99008 39.290580000000006,-8.986540000000002 39.29012,-8.983640000000001 39.28696999999997,-8.980080000000001 39.28847999999999,-8.975190000000001 39.28717,-8.983770000000002 39.253780000000006,-8.981020000000001 39.249329999999986,-8.98361 39.24925999999999,-8.985280000000001 39.24389999999997,-8.988090000000001 39.24078,-8.987540000000001 39.23061000000004,-8.990730000000001 39.22830999999999,-8.9907 39.223209999999995,-8.993860000000002 39.21950000000001,-8.99695 39.20692,-9.004050000000001 39.19323,-9.004560000000001 39.18616,-9.00994 39.18513999999999,-9.012450000000001 39.18784000000002,-9.019210000000001 39.18839999999997,-9.02087 39.18337,-9.029620000000001 39.178979999999996,-9.038670000000002 39.17882,-9.04847 39.173069999999996))';

var defaultStyle = new ol.style.Style({
	image: new ol.style.Circle({
		fill: new ol.style.Fill({
			color: defaultColor + opacity,
		}),
		stroke: new ol.style.Stroke({
			color: defaultColor,
			width: 2,
		}),
		radius: 5,
	}),
	fill: new ol.style.Fill({
		color: defaultColor + opacity,
	}),
	stroke: new ol.style.Stroke({
		color: defaultColor,
		width: 2,
	}),
});

var selectedStyle = new ol.style.Style({
	image: new ol.style.Circle({
		fill: new ol.style.Fill({
			color: selectedColor + opacity,
		}),
		stroke: new ol.style.Stroke({
			color: selectedColor,
		}),
		radius: 5,
	}),
	fill: new ol.style.Fill({
		color: selectedColor + opacity,
	}),
	stroke: new ol.style.Stroke({
		color: selectedColor,
	}),
});

var drawStyle = new ol.style.Style({
	image: new ol.style.Circle({
		fill: new ol.style.Fill({
			color: drawColor + opacity,
		}),
		stroke: new ol.style.Stroke({
			color: drawColor,
		}),
		radius: 5,
	}),
	fill: new ol.style.Fill({
		color: drawColor + opacity,
	}),
	stroke: new ol.style.Stroke({
		color: drawColor,
	}),
});

function init() {

	Object.entries(drawOtion).forEach(([key, value]) => {
		if (!value)
			$("#" + key).parent("label").hide();
	});

	$('div.btn-group input').on('change', function (event) {

		var target = event.target;
		var id = target.id;

		map.removeInteraction(interaction);

		resetColors();

		$('div.btn-group label').addClass("notactive");
		$('div.btn-group label.active').removeClass("notactive");

		switch (id) {
			case "point":
				interaction = new ol.interaction.Draw({
					type: 'Point',
					source: vector.getSource(),
					style: drawStyle
				});

				map.addInteraction(interaction);
				break;
			case "line":
				interaction = new ol.interaction.Draw({
					type: 'LineString',
					source: vector.getSource(),
					style: drawStyle
				});

				map.addInteraction(interaction);
				break;
			case "polygon":
				interaction = new ol.interaction.Draw({
					type: 'Polygon',
					source: vector.getSource(),
					style: drawStyle
				});

				map.addInteraction(interaction);
				break;
			case "modify":
				interaction = new ol.interaction.Modify({
					features: new ol.Collection(vector.getSource().getFeatures()),
					deleteCondition: ol.events.condition.click,
					//condition: ol.events.condition.shiftKeyOnly
				});

				interaction.on('modifyend', updateFeature);

				map.addInteraction(interaction);

				break;
			case "delete":
				interaction = new ol.interaction.Select({
					condition: ol.events.condition.click,
					layers: [vector]
				});
				map.addInteraction(interaction);

				interaction.on('select', selectFeature);
				break;
			case "copy":
				copyWKT();
				break;
			default:
				break;
		}
		var snap = new ol.interaction.Snap({
			source: vector.getSource()
		});
		map.addInteraction(snap);
	});

	createVector();

	//var tiles = new ol.layer.Tile({ source: new ol.source.OSM() });
	var tiles = [
		new ol.layer.Tile({
			// A layer must have a title to appear in the layerswitcher
			title: 'Satelite',
			// Again set this layer as a base layer
			type: 'base',
			visible: true,
			source: new ol.source.XYZ({
				attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
				attributionsCollapsible: false,
				url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				maxZoom: 19
			})
		}),
		new ol.layer.Tile({
			// A layer must have a title to appear in the layerswitcher
			title: 'OSM',
			// Again set this layer as a base layer
			type: 'base',
			visible: true,
			source: new ol.source.OSM()
		})];

	map = new ol.Map({
		layers: [tiles[1], vector],
		target: 'map',
		view: new ol.View({
			center: [-11000000, 4600000],
			zoom: 4
		})
	});

	map.on('pointermove', function (e) {
		if (e.dragging) return;
		var pixel = map.getEventPixel(e.originalEvent);
		var hit = map.hasFeatureAtPixel(pixel);
		map.getTargetElement().style.cursor = hit ? 'pointer' : '';
	});

	document.getElementById('wkt-remove').addEventListener('click', function () {
		vector.getSource().removeFeature(selectedFeature);
		overlay.setPosition(undefined);
		interaction.getFeatures().clear();
	});

	var remove_b = document.getElementById('wkt-overlay');
	overlay = new ol.Overlay({ element: remove_b });
	map.addOverlay(overlay);
	document.getElementById('wkt-overlay').style.display = 'block';

	$('#pan').trigger('click');

	$('#wktStringTextArea').on("click", function () {
		$(this).css({ borderColor: '', backgroundColor: '' });
	});

	document.onkeydown = function (evt) {
		evt = evt || window.event;
		var isEscape = false;
		if ("key" in evt) {
			isEscape = (evt.key === "Escape" || evt.key === "Esc");
		} else {
			isEscape = (evt.keyCode === 27);
		}
		if (isEscape) {
			$('#pan').trigger('click');
		}
	};

	changeUI();
	pasteWKT();

	features.on('add', updateWKY);
	features.on('remove', updateWKY);
}

function updateFeature(event) {
	updateWKY();
}

function selectFeature(event) {
	resetColors();
	selectedFeature = event.selected[0];
	if (selectedFeature) {
		var ext = selectedFeature.getGeometry().getExtent();
		var center = [(ext[0] + ext[2]) / 2, (ext[1] + ext[3]) / 2];
		overlay.setPosition(center);
		selectedFeature.setStyle(selectedStyle);
	}
	else {
		overlay.setPosition(undefined);
	}
}

function resetColors() {
	overlay.setPosition(undefined);
	features.forEach(feature => {
		feature.setStyle(defaultStyle);
	});
}

/**
 * Let user change the geometry type.
 * @param {Event} e Change event.
 */
function createVector() {
	vector = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: features,
		}),
		style: defaultStyle,
	});
}

/**
 * Plot wkt string on map
 */
function writeTextAreaWKT() {

	var new_feature;
	var wkt_string = $('#wktStringTextArea').val();
	if (wkt_string == '') {
		$('#wktStringTextArea').css({ borderColor: 'red', backgroundColor: '#F7E8F3' });
		return;
	} else {
		try {
			new_feature = format.readFeature(wkt_string);
		} catch (err) { }
	}
	if (!new_feature) {
		$('#wktStringTextArea').css({ borderColor: 'red', backgroundColor: '#F7E8F3' });
		return;
	} else {
		map.removeLayer(vector);
		features.clear();

		new_feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

		features.push(new_feature);
	}

	createVector();

	map.addLayer(vector);

	extent = features.getArray()[0].getGeometry().getExtent();
	map.setView(
		new ol.View({
			center: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
			zoom: 8,
		}),
	);

	map.getView().fit(extent, map.getSize());
}

function toEPSG4326(element, index, array) {
	element = element.getGeometry().transform('EPSG:3857', 'EPSG:4326');
}

function toEPSG3857(element, index, array) {
	element = element.getGeometry().transform('EPSG:4326', 'EPSG:3857');
}

function copyWKT() {
	var textarea = document.getElementById('wktStringTextArea');
	textarea.select();
	document.execCommand("copy");
}

async function pasteWKT() {
	try {
		const permission = await navigator.permissions.query({ name: 'clipboard-read' });
		if (permission.state === 'denied') {
			throw new Error('Not allowed to read clipboard.');
		}
		const text = await navigator.clipboard.readText();
		if (text.indexOf('POLYGON') !== -1) {
			$('#wktStringTextArea').val(text);
			writeTextAreaWKT();
		}
	} catch (error) {
		console.error('pasteWKT:', error.message);
	}
	if ($('#wktStringTextArea').val() === "") {
		$('#wktStringTextArea').val(defaultWKT);
		writeTextAreaWKT();
	}
}

function resizeText() {
	var doc = $(document).height();
	var bar = $('.navbar').outerHeight();
	var map = $('#map').outerHeight();
	var buttons = $('.btn-group').outerHeight();
	var text = doc - (bar + map + buttons + 30);
	$('#wktStringTextArea').height(text);
}

function changeUI() {
	$("#wktStringTextArea").css({ fontSize: '0.75rem' });
	window.onresize = resizeText;
	resizeText();
}

function loadWKTfromURIFragment(fragment) {
	// remove first character from fragment as it contains '#'
	var wkt = window.location.hash.slice(1);
	document.getElementById('wktStringTextArea').value = decodeURI(wkt);
}

function updateWKY() {

	$("#wktStringTextArea").css({ borderColor: '', backgroundColor: '' });

	features.forEach(toEPSG4326);

	var polygonsRaw = [];
	features.getArray().forEach(feature => {
		if (typeof feature.getGeometry().getPolygons !== 'undefined') {
			console.log("isMultiple");
			feature.getGeometry().getPolygons().forEach(polygon => {
				polygonsRaw.push(polygon);
			});
		}
		else {
			console.log("isSingle");
			polygonsRaw.push(feature.getGeometry());
		}
	});

	var polygons = [];
	var shapes = "POLYGON( ### )";

	polygonsRaw.forEach(polygon => {

		console.log("polygon:", polygon);

		if (typeof polygon.getCoordinates !== 'undefined')
			coord = polygon.getCoordinates();
		else
			coord = polygon;

		console.log("coord:", coord);

		var data = [];
		coord.getArray().forEach(c => {
			data.push(c[0] + " " + c[1]);
		});

		console.log("data:", data);

		polygons.push("(" + data.join(",") + ")");
	});

	if (polygons.length > 1) {
		shapes = "MULTIPOLYGON((###))";
	}

	shapes = shapes.replace("###", polygons.join("),("));

	console.log("polygons", polygons);

	$('#wktStringTextArea').val(polygons.length > 0 ? shapes : '');



	/*
	features.forEach(toEPSG4326);
		var shapes = format.writeFeatures(features.getArray(), { rightHanded: true, });
		//if (shapes.indexOf('GEOMETRYCOLLECTION')) {
		//	shapes = shapes.replace(/POLYGON/g, '');
		//	shapes = shapes.replace('GEOMETRYCOLLECTION', 'MULTIPOLYGON');
		//}
		$('#wktStringTextArea').val(shapes);

	*/

	features.forEach(toEPSG3857);
}

$(document).ready(init);

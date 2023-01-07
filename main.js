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

var defaultWKT = 'POLYGON((-9.120420000000001 39.46210000000002,-9.100760000000001 39.458110000000005,-9.09225 39.46236999999999,-9.088980000000001 39.46696,-9.08346 39.466939999999994,-9.07999 39.46947,-9.08195 39.47434000000004,-9.064810000000001 39.47493,-9.022020000000001 39.46469000000002,-9.012270000000001 39.45517000000004,-8.991750000000001 39.454650000000015,-8.990350000000001 39.452169999999995,-8.985990000000001 39.45311000000004,-8.98235 39.45052000000001,-8.98469 39.44618,-8.985040000000001 39.433099999999996,-8.990870000000001 39.43129000000002,-8.989090000000001 39.42821000000001,-8.99281 39.427189999999996,-9.004470000000001 39.41660000000002,-9.00802 39.419100000000014,-9.01286 39.41568000000001,-8.99896 39.40545000000003,-8.99723 39.40270000000001,-8.993120000000001 39.40196,-8.98638 39.403729999999996,-8.98564 39.40205,-8.98694 39.40096,-8.985510000000001 39.39844000000002,-8.98858 39.39987999999997,-8.990490000000001 39.39729000000003,-8.986040000000001 39.39428000000001,-8.98606 39.39143999999999,-8.982320000000001 39.38708,-8.98455 39.38173000000003,-8.99163 39.37583000000001,-8.99158 39.37298000000001,-8.9985 39.35989000000001,-8.997850000000001 39.35788000000002,-9.00116 39.3545,-8.999880000000001 39.34610000000001,-8.997770000000001 39.34336999999999,-8.99906 39.33467000000002,-8.996690000000001 39.328840000000014,-8.986680000000002 39.32032000000001,-8.98625 39.317920000000015,-8.993920000000001 39.29674,-8.99806 39.296189999999996,-9.003900000000002 39.29114000000001,-9.01065 39.29149000000001,-9.015400000000001 39.29374999999999,-9.02664 39.29299,-9.03111 39.30338999999998,-9.03935 39.310100000000006,-9.04582 39.31123000000002,-9.05085 39.30996999999999,-9.055810000000001 39.311829999999986,-9.060020000000002 39.30826999999999,-9.063740000000001 39.307589999999976,-9.06638 39.30964,-9.07351 39.30216999999999,-9.07215 39.29930000000002,-9.08506 39.29635000000002,-9.08634 39.30641,-9.091550000000002 39.30770000000001,-9.09215 39.31064999999998,-9.08862 39.321470000000005,-9.094180000000001 39.32525000000001,-9.08825 39.329380000000015,-9.08723 39.332870000000014,-9.083250000000001 39.33259000000001,-9.079400000000001 39.328869999999995,-9.07446 39.33221,-9.05672 39.33521999999999,-9.05879 39.335230000000024,-9.059890000000001 39.339229999999986,-9.06487 39.34576000000001,-9.068840000000002 39.34681999999998,-9.06792 39.34820000000005,-9.07324 39.350570000000005,-9.07319 39.352990000000005,-9.07558 39.35203999999999,-9.07719 39.35536999999999,-9.08411 39.35619,-9.09744 39.364540000000005,-9.09961 39.37576999999999,-9.10313 39.383129999999966,-9.10462 39.38184000000001,-9.113420000000001 39.38463999999999,-9.11665 39.38345000000001,-9.11856 39.38541000000001,-9.12462 39.38420000000002,-9.13029 39.39016000000001,-9.13118 39.38817,-9.13626 39.38649000000001,-9.146830000000001 39.39443,-9.16324 39.396150000000006,-9.177050000000001 39.40105,-9.185920000000001 39.401219999999995,-9.19199 39.40473,-9.19927 39.401880000000006,-9.206330000000001 39.40135000000001,-9.2101 39.39877999999999,-9.21376 39.39914000000002,-9.214920000000001 39.40208999999999,-9.211020000000001 39.40467000000001,-9.211110000000001 39.40673000000001,-9.21681 39.41068000000001,-9.2218 39.42063999999996,-9.221250000000001 39.42684,-9.224540000000001 39.4273,-9.229600000000001 39.42496,-9.235000000000001 39.42606999999998,-9.235850000000001 39.42769999999999,-9.23291 39.429339999999996,-9.233500000000001 39.43168,-9.22597 39.43769000000003,-9.21376 39.453509999999994,-9.2119 39.45422000000002,-9.20983 39.460289999999986,-9.20409 39.46770000000001,-9.203800000000001 39.47325000000001,-9.19551 39.475250000000045,-9.19513 39.47725,-9.18776 39.484849999999994,-9.18453 39.48577,-9.17683 39.49544,-9.172030000000001 39.49700999999999,-9.172270000000001 39.500820000000004,-9.15032 39.50996000000001,-9.145470000000001 39.50923000000003,-9.14972 39.50134,-9.1409 39.49265,-9.13818 39.486459999999994,-9.123990000000001 39.479029999999995))';

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
					source: vector.getSource()
				});

				map.addInteraction(interaction);
				break;
			case "line":
				interaction = new ol.interaction.Draw({
					type: 'LineString',
					source: vector.getSource()
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
					deleteCondition: ol.events.condition.dblclick
				});

				interaction.on('modifyend', updateWKY);

				map.addInteraction(interaction);

				break;
			case "delete":
				interaction = new ol.interaction.Select({
					condition: ol.events.condition.click,
					layers: [vector]
				});
				map.addInteraction(interaction);

				interaction.on('select', function (event) {
					resetColors();
					selectedFeature = event.selected[0];
					if (selectedFeature) {
						overlay.setPosition(selectedFeature.getGeometry().getExtent());
						selectedFeature.setStyle(selectedStyle);
					}
					else {
						overlay.setPosition(undefined);
					}

				});
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

	features.on('add', updateWKY);
	features.on('remove', updateWKY);

	map = new ol.Map({
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM()
			}),
			vector
		],
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
function plotWKT() {
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
	vector = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: features,
		}),
		style: defaultStyle,
	});

	map.addLayer(vector);

	derived_feature = features.getArray()[0];
	extent = derived_feature.getGeometry().getExtent();
	minx = derived_feature.getGeometry().getExtent()[0];
	miny = derived_feature.getGeometry().getExtent()[1];
	maxx = derived_feature.getGeometry().getExtent()[2];
	maxy = derived_feature.getGeometry().getExtent()[3];
	centerx = (minx + maxx) / 2;
	centery = (miny + maxy) / 2;

	map.setView(
		new ol.View({
			center: [centerx, centery],
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
			plotWKT();
		}
	} catch (error) {
		console.error('pasteWKT:', error.message);
	}
	if ($('#wktStringTextArea').val() === "") {
		$('#wktStringTextArea').val(defaultWKT);
		plotWKT();
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

	var polygons = [];
	var shapeType = "POLYGON((###))";
	features.getArray().map((f) => f.getGeometry().getCoordinates()).forEach(polygon => {
		var data = [];
		polygon[0].forEach(coord => {
			data.push(coord[0] + " " + coord[1]);
		});
		polygons.push(data.join(","));
	});

	if (polygons.length > 1) {
		shapeType = "MULTIPOLYGON(((###)))";
	}
	shapeType = shapeType.replace("###", polygons.join("),("));
	$('#wktStringTextArea').val(polygons.length > 0 ? shapeType : '');

	features.forEach(toEPSG3857);
}

$(document).ready(init);

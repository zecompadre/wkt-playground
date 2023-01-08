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

var defaultWKT = 'POLYGON((-9.14506807923317 39.38111339993614,-9.144595339894295 39.38078376130565,-9.14483405649662 39.38059250799037,-9.144903793931007 39.38062930744948,-9.145147204399109 39.380804493340804,-9.145106971263885 39.380839219486035,-9.145151227712633 39.3808734273137,-9.145190790295601 39.380843365890286,-9.14529874920845 39.38092059262428,-9.14506807923317 39.38111339993614))';

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
					deleteCondition: ol.events.condition.click
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
						var ext = selectedFeature.getGeometry().getExtent();
						var center = [(ext[0] + ext[2]) / 2, (ext[1] + ext[3]) / 2];
						overlay.setPosition(center);
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

	var tiles = new ol.layer.Tile({
		source: new ol.source.XYZ({
			attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
			attributionsCollapsible: false,
			url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			maxZoom: 19
		})
	});

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

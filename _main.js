var app = (function () {
	// Constants and configurations
	const projections = {
		geodetic: 'EPSG:4326',
		mercator: 'EPSG:3857',
	};

	const colors = {
		normal: '#141414',
		edit: '#ec7063',
		snap: '#34495e',
	};

	const mapDefaults = {
		latitude: 39.6945,
		longitude: -8.1234,
		zoom: 6,
	};

	let map, vectorLayer, format, defaultCenter, featureCollection;

	// Utility functions
	const utilities = {
		hexToRgbA: (hex) => {
			const bigint = parseInt(hex.replace(/^#/, ''), 16);
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;
			return `rgba(${r}, ${g}, ${b}, 0.2)`;
		},

		transformCoordinates: (coords, from, to) =>
			ol.proj.transform(coords, from, to),

		getFeatureWKT: (feature) => {
			const geom = feature.getGeometry().clone();
			return format.writeGeometry(geom.transform(projections.mercator, projections.geodetic));
		},

		generateChecksum: async (input) => {
			if (!input) return input;
			const encoder = new TextEncoder();
			const data = encoder.encode(input);
			const hashBuffer = await crypto.subtle.digest('SHA-256', data);
			return Array.from(new Uint8Array(hashBuffer))
				.map((byte) => byte.toString(16).padStart(2, '0'))
				.join('');
		},

		createVectorLayer: () => {
			vectorLayer = new ol.layer.Vector({
				source: new ol.source.Vector({ features: featureCollection }),
				style: utilities.createStyles(colors.normal),
			});
		},

		createStyles: (color) => [
			new ol.style.Style({
				image: new ol.style.Circle({
					fill: new ol.style.Fill({ color: utilities.hexToRgbA(color) }),
					stroke: new ol.style.Stroke({ color, width: 2 }),
					radius: 5,
				}),
				fill: new ol.style.Fill({ color: utilities.hexToRgbA(color) }),
				stroke: new ol.style.Stroke({ color, width: 2 }),
			}),
		],
	};

	// Feature collection utilities
	const featureUtilities = {
		centerOnFeature: (feature) => {
			const extent = feature.getGeometry().getExtent();
			const center = ol.extent.getCenter(extent);
			map.getView().setCenter(center);
			map.getView().fit(extent, { size: map.getSize(), padding: [50, 50, 50, 50] });
		},

		featuresToMultiPolygon: () => {
			const features = vectorLayer.getSource().getFeatures();
			const polygons = features.filter((f) =>
				['Polygon', 'MultiPolygon'].includes(f.getGeometry().getType())
			);

			if (!polygons.length) return null;

			const geometries = polygons.map((f) => f.getGeometry());
			return new ol.Feature(
				new ol.geom.MultiPolygon(
					geometries.map((g) =>
						g.getType() === 'Polygon' ? g.getCoordinates() : g.getCoordinates()
					)
				)
			);
		},
	};

	// Map setup
	function setupMap() {
		format = new ol.format.WKT();
		featureCollection = new ol.Collection();
		defaultCenter = utilities.transformCoordinates(
			[mapDefaults.longitude, mapDefaults.latitude],
			projections.geodetic,
			projections.mercator
		);

		// Initialize map and layers
		utilities.createVectorLayer();
		map = new ol.Map({
			layers: [
				new ol.layer.Tile({ source: new ol.source.OSM() }),
				vectorLayer,
			],
			target: 'map',
			view: new ol.View({ center: defaultCenter, zoom: mapDefaults.zoom }),
		});

		// Add controls and interactions
		addControlsAndInteractions();
	}

	function addControlsAndInteractions() {
		const mainBar = new ol.control.Bar();
		map.addControl(mainBar);

		const editBar = new ol.control.Bar({ toggleOne: true, group: false });
		mainBar.addControl(editBar);

		const selectBar = new ol.control.Bar();
		const selectCtrl = new ol.control.Toggle({
			html: '<i class="fa-solid fa-arrow-pointer"></i>',
			title: "Select",
			interaction: new ol.interaction.Select({
				hitTolerance: 2,
				style: utilities.createStyles(colors.edit),
			}),
			bar: selectBar,
		});

		editBar.addControl(selectCtrl);

		const modifyInteraction = new ol.interaction.ModifyFeature({
			features: selectCtrl.getInteraction().getFeatures(),
			style: utilities.createStyles(colors.snap),
		});

		map.addInteraction(modifyInteraction);

		// Sync interactions
		selectCtrl.getInteraction().on('change:active', () => {
			modifyInteraction.setActive(selectCtrl.getInteraction().getActive());
		});
	}

	return {
		init: () => {
			setupMap();
		},
	};
})();
var app = (function () {

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

	var tileLayer;
	var vectorLayer;
	var map;
	var modifyInteraction;
	var undoInteraction;
	var featureCollection = new ol.Collection();
	var format = new ol.format.WKT();

	var lfkey = "zecompadre-wkt";

	var defaultCenter = ol.proj.transform([mapDefaults.longitude, mapDefaults.latitude], projections.geodetic, projections.mercator);

	var main = document.querySelector(".maincontainer");
	var textarea = document.querySelector("#wktdefault textarea");

	function getFeaturesFromVectorLayer() {
		return vectorLayer.getSource().getFeatures();;
	}

	function getFeatureWKT(feature) {
		return format.writeGeometry(new ol.Feature({
			geometry: feature.getGeometry().clone()
		}).getGeometry().transform(projections.mercator, projections.geodetic));
	}

	function centerOnFeature(feature) {
		console.log("centerOnFeature");

		const extent = feature.getGeometry().getExtent(); // Returns [minX, minY, maxX, maxY]
		const center = ol.extent.getCenter(extent); // Calculate the center
		console.log('Center coordinates:', center);

		// Center the map view
		map.setView(new ol.View({
			center: center,
			zoom: 8, // Adjust the zoom level as needed
		}));

		// Adjust the view to fit the feature extent
		map.getView().fit(extent, {
			size: map.getSize(), // Ensures the geometry fits well in the viewport
			padding: [50, 50, 50, 50], // Optional padding around the feature
		});
	}

	function imageCanvas(feature) {

		const _0x44fc83 = document.getElementById("map");
		const _0x8b5714 = _0x44fc83.offsetWidth;
		const _0xb507ab = _0x44fc83.offsetHeight;
		domtoimage.toPng(_0x44fc83, {
			"width": _0x8b5714,
			"height": _0xb507ab
		})
			.then(function (dataUrl) {
				var img = new Image();
				img.src = dataUrl;
				document.body.appendChild(img);
			})
			.catch(function (error) {
				console.error('oops, something went wrong!', error);
			});
	}

	/* 	function deselectFeature() {
			select.getFeatures().clear();
			map.getControls().forEach(function (control) {
				if (control instanceof EditorControl) {
					control.hide();
				}
			});
		} */

	async function getIP() {
		try {
			// Using ipify.org as an example API
			const response = await fetch('https://api.ipify.org?format=json');

			if (!response.ok) {
				throw new Error('Failed to fetch IP address');
			}

			const data = await response.json();
			return data.ip;
		} catch (error) {
			console.error('Error fetching IP:', error);
			return 'Unable to retrieve IP address';
		}
	}

	async function getLocation() {
		return new Promise((resolve, reject) => {
			// Check if geolocation is available
			if (!navigator.geolocation) {
				reject('Geolocation is not supported by your browser');
				return;
			}

			// Handle errors
			function handleError(error) {
				switch (error.code) {
					case error.PERMISSION_DENIED:
						reject('User denied the request for Geolocation');
					case error.POSITION_UNAVAILABLE:
						reject('Location information is unavailable');
					case error.TIMEOUT:
						reject('The request to get user location timed out');
					case error.UNKNOWN_ERROR:
						reject('An unknown error occurred while retrieving coordinates');
				}
				reject('Error getting location');
			}

			// Get current position
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const latitude = position.coords.latitude.toFixed(4);
					const longitude = position.coords.longitude.toFixed(4);

					console.log(`Latitude: ${latitude}`);
					console.log(`Longitude: ${longitude}`);

					resolve({ latitude: latitude, longitude: longitude });
				},
				handleError
			);
		});
	}

	async function centerMap() {
		if (!main.classList.contains("nowkt")) {
			const extent = ol.extent.createEmpty();
			featureCollection.forEach(feature => ol.extent.extend(extent, feature.getGeometry().getExtent()));
			map.getView().fit(extent, {
				size: map.getSize(),
				padding: [50, 50, 50, 50],
			});
		} else {
			console.log("defaultCenter", defaultCenter);
			map.getView().setCenter(defaultCenter);
			map.getView().setZoom(16);
		}
	}

	function hexToRgbA(hex) {
		// Remove the "#" if present
		hex = hex.replace(/^#/, '');

		// Parse the hex color into RGB components
		let bigint = parseInt(hex, 16);
		let r = (bigint >> 16) & 255;
		let g = (bigint >> 8) & 255;
		let b = bigint & 255;

		return `rgba(${r}, ${g}, ${b},0.2)`;
	}

	async function generateChecksum(inputString) {
		if (inputString === "")
			return inputString;

		const encoder = new TextEncoder();
		const data = encoder.encode(inputString);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const checksum = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
		return checksum;
	}

	function getMapsFeatureCount() {
		var vectorLayer = map.getLayers().getArray().find(layer => layer instanceof ol.layer.Vector);
		if (!vectorLayer) {
			console.error('No vector layer found on the map.');
			return 0;
		}

		// Get all features from the vector layer
		var features = vectorLayer.getSource().getFeatures();

		return features.length;

	}

	function featuresToMultiPolygon() {
		// Get the vector layer from the map
		var vectorLayer = map.getLayers().getArray().find(layer => layer instanceof ol.layer.Vector);
		if (!vectorLayer) {
			console.error('No vector layer found on the map.');
			return null;
		}

		// Get all features from the vector layer
		var features = vectorLayer.getSource().getFeatures();

		// Filter the features to include only polygons and multi-polygons
		var polygons = features.filter(function (feature) {
			var geometryType = feature.getGeometry().getType();
			return geometryType === 'Polygon' || geometryType === 'MultiPolygon';
		});

		// If there are no polygons or multi-polygons, return null
		if (polygons.length === 0) {
			console.error('No polygons or multi-polygons found.');
			return null;
		}

		// Create an array of geometries from the features
		var geometries = polygons.map(function (feature) {
			return feature.getGeometry();
		});

		// Create a MultiPolygon geometry from the array of geometries
		var multiPolygon = new ol.geom.MultiPolygon(geometries.map(function (geometry) {
			// Ensure that each geometry is in the correct format for MultiPolygon
			return geometry.getType() === 'Polygon' ? geometry.getCoordinates() : geometry.getCoordinates();
		}));

		// Optionally, add the MultiPolygon as a new feature on the map
		var multiPolygon = new ol.Feature(multiPolygon);

		// Return the created MultiPolygon geometry
		return multiPolygon;
	}

	var LS_WKTs = {
		load: function () {
			var wkts = localStorage.getItem(lfkey) || "[]";
			map.set("wkts", JSON.parse(wkts));
		},
		remove: function (id) {
			var wkts = map.get("wkts");
			wkts = wkts.filter(function (item) {
				return item.id !== id;
			});
			map.set("wkts", wkts);
			this.save();
		},
		save: function () {
			localStorage.setItem(lfkey, JSON.stringify(this.get()));
		},
		add: async function (wkt) {
			var self = this;
			await generateChecksum(wkt).then(function (checksum) {
				var exists = false;
				var wkts = map.get("wkts");
				if (wkts.length > 0) {
					wkts.forEach(item => {
						if (checksum !== "" && item.id === checksum)
							exists = true;
					});
				}
				if (wkt != "" && !exists) {
					wkts.push({ id: checksum, wkt: wkt });
				}
				map.set("wkts", wkts);
				self.save();
			});

		},
		get: function () {
			return map.get("wkts");
		},
		update: function (id, wkt) {
			var wkts = map.get("wkts");
			if (wkts.length > 0) {
				wkts.forEach(function (item) {
					if (item.id === id)
						item.wkt = wkt;
				});
			}
			map.set("wkts", wkts);
			this.save();
		}
	}

	function styles(color) {
		return [
			new ol.style.Style({
				image: new ol.style.Circle({
					fill: new ol.style.Fill({
						color: hexToRgbA(color)
					}),
					stroke: new ol.style.Stroke({
						color: color,
						width: 2
					}),
					radius: 5
				}),
				fill: new ol.style.Fill({
					color: hexToRgbA(color)
				}),
				stroke: new ol.style.Stroke({
					color: color,
					width: 2
				})
			})
		];
	}

	return {
		createVector: function () {
			vectorLayer = new ol.layer.Vector({
				source: new ol.source.Vector({ features: featureCollection }),
				style: styles(colors.normal)
			})
		},
		toEPSG4326: function (element, index, array) {
			element = element.getGeometry().transform(projections.mercator, projections.geodetic);
		},
		toEPSG3857: function (element, index, array) {
			element = element.getGeometry().transform(projections.geodetic, projections.mercator);
		},
		restoreDefaultColors: function () {
			textarea.style.borderColor = "";
			textarea.style.backgroundColor = "";
		},
		addFeatures: async function () {
			if (vectorLayer)
				map.removeLayer(vectorLayer); // Remove a camada existente
			this.createVector(); // Aguarda a criação da camada
			if (vectorLayer)
				map.addLayer(vectorLayer); // Adiciona a nova camada ao mapa
			else
				console.error("Falha ao criar a camada 'vector'. Verifique a função createVector.");
		},
		addToFeatures: function (id, wkt) {
			var new_feature;
			var wkt_string = wkt || textarea.value;
			if (wkt_string === "") {
				textarea.style.borderColor = "red";
				textarea.style.backgroundColor = "#F7E8F3";
				return;
			} else {
				try {
					new_feature = format.readFeature(wkt_string);
				} catch (err) {
					console.error('Error reading WKT:', err);
				}
			}
			if (!new_feature) {
				textarea.style.borderColor = "red";
				textarea.style.backgroundColor = "#F7E8F3";
				return;
			} else {
				new_feature.getGeometry().transform(projections.geodetic, projections.mercator);
				new_feature.setId(id);
				featureCollection.push(new_feature);
			}
		},
		clipboardWKT: async function () {

			var returnVal = "";

			try {

				textarea.focus();

				const permission = await navigator.permissions.query({ name: 'clipboard-read' });
				if (permission.state === 'denied') {
					throw new Error('Not allowed to read clipboard.');
				}

				const text = await navigator.clipboard.readText();
				if (text.indexOf('POLYGON') !== -1) {
					returnVal = text;
					navigator.clipboard.writeText("");
				}
			} catch (error) {
				console.error('clipboardWKT:', error.message);
			}
			return returnVal;
		},
		pasteWKT: async function (ele) {
			await LS_WKTs.add(ele.value).then(async function (result) {
				await this.loadWKTs();
			});
		},
		loadWKTs: async function (readcb) {

			var self = this;

			LS_WKTs.load();

			var wkts = LS_WKTs.get();

			textarea.focus();

			var wkt = "";
			if (readcb)
				wkt = await self.clipboardWKT();

			await generateChecksum(wkt).then(async function (checksum) {
				if (wkts == null || wkts == undefined)
					wkts = [];

				var exists = false;
				var idx = 0;

				if (wkts.length > 0) {
					wkts.forEach(item => {
						if (checksum !== "" && item.id === checksum)
							exists = true;
						self.addToFeatures(item.id, item.wkt);
						idx = idx + 1;
					});
				}

				if (wkt != "" && !exists) {
					wkts.push({ id: checksum, wkt: wkt });
					self.addToFeatures(checksum, wkt);
					idx = idx + 1;
				}

				map.set("wkts", wkts);

				LS_WKTs.save()

				await self.addFeatures().then(async function () {

					if (getMapsFeatureCount() > 0)
						main.classList.remove("nowkt");
					else
						main.classList.add("nowkt");

					await centerMap().then(function () {
						var multi = featuresToMultiPolygon();
						var geo = multi.getGeometry().transform(projections.mercator, projections.geodetic);
						textarea.value = format.writeGeometry(geo);

						map.updateSize();
					});

				});
			});
			// });
		},
		setupMap: function () {

			var self = this;

			main = document.querySelector(".maincontainer");
			textarea = document.querySelector("#wktdefault textarea");

			tileLayer = new ol.layer.Tile({
				source: new ol.source.OSM()
			});

			this.createVector();

			map = new ol.Map({
				layers: [tileLayer, vectorLayer],
				target: 'map',
				view: new ol.View({
					center: defaultCenter,
					zoom: mapDefaults.zoom
				})
			});

			map.addInteraction(new ol.interaction.DragPan({
				condition: function (event) {
					return true;
				}
			}));

			map.addInteraction(new ol.interaction.MouseWheelZoom({
				condition: function (event) {
					return true;
				}
			}));

			// Main control bar
			var mainBar = new ol.control.Bar();
			map.addControl(mainBar);

			// Edit control bar 
			var editBar = new ol.control.Bar({
				toggleOne: true,	// one control active at the same time
				group: false			// group controls together
			});
			mainBar.addControl(editBar);

			// Add selection tool:
			//  1- a toggle control with a select interaction
			//  2- an option bar to delete / get information on the selected feature
			var selectBar = new ol.control.Bar();

			var deleteBtn = new ol.control.Button({
				html: '<i class="fa fa-times"></i>',
				name: "Delete",
				title: "Delete",
				handleClick: function () {
					var features = selectCtrl.getInteraction().getFeatures();

					if (!features.getLength())
						textarea.value = "Select an object first...";
					else {
						var feature = features.item(0);
						LS_WKTs.remove(feature.getId());
						for (var i = 0, f; f = features.item(i); i++) {
							vectorLayer.getSource().removeFeature(f);
						}
						features.clear();
					}
				}
			});

			selectBar.addControl(deleteBtn);

			var infoBtn = new ol.control.Button({
				html: '<i class="fa fa-info"></i>',
				name: "Info",
				title: "Show informations",
				handleClick: function () {
					switch (selectCtrl.getInteraction().getFeatures().getLength()) {
						case 0:
							textarea.value = "Select an object first...";
							break;
						case 1:
							textarea.value = getFeatureWKT(selectCtrl.getInteraction().getFeatures().item(0));
							break;
					}
				}
			});

			selectBar.addControl(infoBtn);

			selectBar.setVisible(false);

			selectCtrl = new ol.control.Toggle({
				html: '<i class="fa-solid fa-arrow-pointer"></i>',
				title: "Select",
				interaction: new ol.interaction.Select({ hitTolerance: 2, style: styles(colors.edit) }),
				bar: selectBar,
				autoActivate: true,
				active: true
			});
			editBar.addControl(selectCtrl);

			modifyInteraction = new ol.interaction.ModifyFeature({
				features: selectCtrl.getInteraction().getFeatures(),
				style: styles(colors.snap),
				insertVertexCondition: function () {
					return true;
				},
			})

			map.addInteraction(modifyInteraction);

			// Activate with select
			modifyInteraction.setActive(selectCtrl.getInteraction().getActive())
			selectCtrl.getInteraction().on('change:active', function () {
				modifyInteraction.setActive(selectCtrl.getInteraction().getActive())
			}.bind(editBar));

			drawCtrl = new ol.control.Toggle({
				html: '<i class="fa-solid fa-draw-polygon"></i>',
				title: 'Polygon',
				interaction: new ol.interaction.Draw({
					type: 'Polygon',
					source: vectorLayer.getSource()
				})
			});
			editBar.addControl(drawCtrl);

			// Undo redo interaction
			undoInteraction = new ol.interaction.UndoRedo();
			map.addInteraction(undoInteraction);

			// Add buttons to the bar
			var undoBar = new ol.control.Bar({
				group: true,
				controls: [
					new ol.control.Button({
						html: '<i class="fa-solid fa-rotate-left"></i>',
						title: 'Undo...',
						handleClick: function () {
							undoInteraction.undo();
						}
					}),
					new ol.control.Button({
						html: '<i class="fa-solid fa-rotate-right"></i>',
						title: 'Redo...',
						handleClick: function () {
							undoInteraction.redo();
						}
					})
				]
			});
			mainBar.addControl(undoBar);

			/* undo/redo custom */
			var style;
			// Define undo redo for the style
			undoInteraction.define(
				'style',
				// undo function: set previous style
				function (s) {
					style = s.before;
					vectorLayer.changed();
				},
				// redo function: reset the style
				function (s) {
					style = s.after;
					vectorLayer.changed();
				}
			);

			map.addInteraction(new ol.interaction.Snap({
				source: vectorLayer.getSource()
			}));

			draw = drawCtrl.getInteraction().on('drawend', async function (evt) {
				wkt = getFeatureWKT(evt.feature);
				await LS_WKTs.add(wkt).then(function (result) {
					centerOnFeature(evt.feature);
				});
			});

			select = selectCtrl.getInteraction().on('select', function (evt) {
				app.restoreDefaultColors();
				if (evt.deselected.length > 0) {
					evt.deselected.forEach(function (feature) {
						textarea.value = getFeatureWKT(feature);
						LS_WKTs.update(feature.getId(), textarea.value);
						var multi = featuresToMultiPolygon();
						var geo = multi.getGeometry().transform(projections.mercator, projections.geodetic);
						textarea.value = format.writeGeometry(geo);
					});
					selectBar.setVisible(false);
				}

				if (evt.selected.length > 0) {
					evt.selected.forEach(function (feature) {
						textarea.value = getFeatureWKT(feature);
					});
					selectBar.setVisible(true);
				}
			});
		},

		init: function () {
			var self = this;

			getLocation().then(location => {
				console.log("location", location);

				defaultCenter = ol.proj.transform([location.longitude, location.latitude], projections.geodetic, projections.mercator);

				self.setupMap();

				self.loadWKTs(true);
			});

			getIP().then(ip => {
				if (typeof ip === 'string' && ip.startsWith('http')) {
					navigator.geolocation.getCurrentPosition(position => {
						latitude = position.coords.latitude;
						longitude = position.coords.longitude;
						console.log(`Estimated IP based on location: ${latitude}, ${longitude}`);
					});
				} else {
					console.log(`Retrieved IP address: ${ip}`);
				}
			});

		}
	};

}());
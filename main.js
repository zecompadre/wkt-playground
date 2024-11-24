var app = (function () {

	var raster;
	var vector;
	var map;
	var draw;
	var snap;
	var drag;
	var select;
	var remove;
	var modify;
	var mousewheelzoom;
	var features = new ol.Collection();
	var format = new ol.format.WKT();

	var current_wkts = [];

	var shape = "Polygon";

	var lfkey = "zecompadre-wkt";

	var normalColor = '#141414'; //'#005baa';
	var editColor = '#ec7063';
	var snapColor = '#34495e';

	var projection_geodetic = 'EPSG:4326';
	var projection_mercator = 'EPSG:3857';

	var latitude = 39.6945;
	var longitude = -8.1234;

	var defaultCenter = ol.proj.transform([longitude, latitude], projection_geodetic, projection_mercator);

	var main = document.querySelector(".maincontainer");
	var textarea = document.querySelector("#wktdefault textarea");

	function getFeatureWKT(feature) {

		// Criar uma nova feature com a geometria clonada
		const clonedFeature = new ol.Feature({
			geometry: feature.getGeometry().clone()
		});

		var geo = clonedFeature.getGeometry().transform(projection_mercator, projection_geodetic);
		var wkt = format.writeGeometry(geo);

		return wkt;
	}

	function centerOnFeature(feature) {

		console.log("centerOnFeature");

		let extent = feature.getGeometry().getExtent(); // Returns [minX, minY, maxX, maxY]
		let center = ol.extent.getCenter(extent); // Calculate the center

		console.log('Center coordinates:', center);

		minx = extent[0];
		miny = extent[1];
		maxx = extent[2];
		maxy = extent[3];
		centerx = (minx + maxx) / 2;
		centery = (miny + maxy) / 2;
		map.setView(new ol.View({
			center: [centerx, centery],
			zoom: 8
		}));
		map.getView().fit(extent, {
			size: map.getSize(), // Map size to ensure the geometry fits well
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
		return new Promise((resolve, reject) => {
			if (!main.classList.contains("nowkt")) {
				var extent = ol.extent.createEmpty();
				features.forEach(function (feature) {
					ol.extent.extend(extent, feature.getGeometry().getExtent());
				});
				map.getView().fit(extent, map.getSize());
			}
			else {
				console.log("defaultCenter", defaultCenter);
				map.getView().setCenter(defaultCenter);
				map.getView().setZoom(16);
			}
			resolve();
		});
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

	function featuresToMultiPolygon() {

		const polygonCoordinates = features.getArray().map(feature => {
			const geometry = feature.getGeometry();
			const geometryType = geometry.getType();

			switch (geometryType) {
				case 'Polygon':
					return [geometry.getCoordinates()]; // Wrap in an array to standardize structure
				case 'MultiPolygon':
					return geometry.getCoordinates(); // MultiPolygon already provides an array of polygons
				default:
					throw new Error('Feature is neither a Polygon nor a MultiPolygon');
			}
		}).flat();

		// Create a MultiPolygon geometry
		const multiPolygonGeometry = new ol.geom.MultiPolygon(polygonCoordinates);

		// Optionally, create a new feature with the MultiPolygon geometry
		const multiPolygonFeature = new ol.Feature({
			geometry: multiPolygonGeometry
		});

		return multiPolygonFeature;
	}

	var LS_WKTs = {
		load: function () {
			var wkts = localStorage.getItem(lfkey) || "[]";
			current_wkts = JSON.parse(wkts);
		},
		remove: function (id) {
			current_wkts = current_wkts.filter(function (item) {
				return item.id !== id;
			});
			this.save();
		},
		save: function () {
			localStorage.setItem(lfkey, JSON.stringify(current_wkts));
		},
		add: async function (wkt) {
			var self = this;
			await generateChecksum(wkt).then(function (checksum) {
				var exists = false;
				if (current_wkts.length > 0) {
					current_wkts.forEach(item => {
						if (checksum !== "" && item.id === checksum)
							exists = true;
					});
				}
				if (wkt != "" && !exists) {
					current_wkts.push({ id: checksum, wkt: wkt });
				}
				self.save();
			});

		},
		get: function () {
			return current_wkts;
		},
		update: function (id, wkt) {
			current_wkts.forEach(function (item) {
				if (item.id === id)
					item.wkt = wkt;
			});
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
			vector = new ol.layer.Vector({
				source: new ol.source.Vector({ features: features }),
				style: styles(normalColor)
			})
		},
		toEPSG4326: function (element, index, array) {
			element = element.getGeometry().transform(projection_mercator, projection_geodetic);
		},
		toEPSG3857: function (element, index, array) {
			element = element.getGeometry().transform(projection_geodetic, projection_mercator);
		},
		restoreDefaultColors: function () {
			textarea.style.borderColor = "";
			textarea.style.backgroundColor = "";
		},
		addFeatures: async function () {
			map.removeLayer(vector);
			this.createVector();
			map.addLayer(vector);
		},
		// resetFeatures: async function () {
		// 	features = new ol.Collection();
		// 	map.removeLayer(vector);
		// 	//deselectFeature()
		// },
		plotWKT: function (id, wkt) {

			var new_feature;
			wkt_string = wkt || textarea.value;
			if (wkt_string == "") {
				textarea.style.borderColor = "red";
				textarea.style.backgroundColor = "#F7E8F3";
				return;
			} else {
				try {
					new_feature = format.readFeature(wkt_string);
				} catch (err) {
				}
			}
			if (!new_feature) {
				textarea.style.borderColor = "red";
				textarea.style.backgroundColor = "#F7E8F3";
				return;
			} else {
				new_feature.getGeometry().transform(projection_geodetic, projection_mercator);
				new_feature.setId(id);
				features.push(new_feature);
			}
		},
		// removeWKT: async function () {

		// 	// if (select.getFeatures().item.length > 0) {

		// 	// 	var current = select.getFeatures().item(0);

		// 	// 	LS_WKTs.remove(current.getId());

		// 	// 	await app.loadWKTs(false);
		// 	// }
		// },
		// addWKT: function () {

		// 	console.log("addWKT");

		// 	//map.removeInteraction(select);
		// 	//map.addInteraction(draw);
		// 	textarea.value = "";
		// },
		// copyWKT: async function () {

		// 	textarea.select();
		// 	document.execCommand("copy");
		// 	textarea.blur();

		// 	//deselectFeature();

		// 	app.restoreDefaultColors();
		// },
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

			// await self.resetFeatures().then(async function () {
			LS_WKTs.load();

			var wkts = current_wkts;

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
						idx = idx + 1;
						if (checksum !== "" && item.id === checksum)
							exists = true;
						self.plotWKT(item.id, item.wkt);
					});
				}

				if (wkt != "" && !exists) {
					idx = idx + 1;
					self.plotWKT(checksum, wkt);
					wkts.push({ id: checksum, wkt: wkt });
				}

				current_wkts = wkts;

				LS_WKTs.save()

				await self.addFeatures().then(async function () {

					if (features.getArray().length > 0)
						main.classList.remove("nowkt");
					else
						main.classList.add("nowkt");

					await centerMap().then(function () {
						var multi = featuresToMultiPolygon();
						var geo = multi.getGeometry().transform(projection_mercator, projection_geodetic);
						textarea.value = format.writeGeometry(geo);

						map.updateSize();
					});

				});
			});
			// });
		},
		prepareObjets: function () {

			var self = this;

			main = document.querySelector(".maincontainer");
			textarea = document.querySelector("#wktdefault textarea");

			raster = new ol.layer.Tile({
				source: new ol.source.OSM()
			});

			this.createVector();

			// select = new ol.interaction.Select({
			// 	style: styles(editColor),
			// });

			// select.on('select', function (evt) {

			// 	if (evt.deselected.length > 0) {

			// 		evt.deselected.forEach(function (feature) {

			// 			self.restoreDefaultColors();
			// 			var geo = feature.getGeometry().transform(projection_mercator, projection_geodetic);
			// 			textarea.value = format.writeGeometry(geo);
			// 			var geo = feature.getGeometry().transform(projection_geodetic, projection_mercator);

			// 			LS_WKTs.update(feature.getId(), textarea.value);

			// 			var multi = featuresToMultiPolygon();
			// 			var geo = multi.getGeometry().transform(projection_mercator, projection_geodetic);
			// 			textarea.value = format.writeGeometry(geo);
			// 		});

			// 		map.getControls().forEach(function (control) {
			// 			if (control instanceof EditorControl) {
			// 				control.hide();
			// 			}
			// 		});
			// 	}

			// 	if (evt.selected.length > 0) {

			// 		map.getControls().forEach(function (control) {
			// 			if (control instanceof EditorControl) {
			// 				control.show();
			// 			}
			// 		});

			// 		evt.selected.forEach(function (feature) {
			// 			CurrentTextarea.set(feature);
			// 		});
			// 	}
			// });

			// modify = new ol.interaction.Modify({
			// 	features: select.getFeatures(),
			// 	style: styles(snapColor),
			// 	insertVertexCondition: function () {
			// 		return true;
			// 	},
			// });

			drag = new ol.interaction.DragPan({
				condition: function (event) {
					return true;
				}
			});

			mousewheelzoom = new ol.interaction.MouseWheelZoom({
				condition: function (event) {
					return true;
				}
			});

			// draw.on('drawend', async function (evt) {

			// 	var geo = evt.feature.getGeometry().transform(projection_mercator, projection_geodetic);
			// 	var wkt = format.writeGeometry(geo);

			// 	await LS_WKTs.add(wkt).then(async function (result) {
			// 		await app.loadWKTs(false).then(function () {
			// 			map.removeInteraction(draw);
			// 			map.addInteraction(select);
			// 			//centerOnFeature(evt.feature);
			// 			//imageCanvas(evt.feature);
			// 		});
			// 	});
			// });

			map = new ol.Map({
				interactions: [mousewheelzoom, drag/* , select, modify */],
				layers: [raster, vector],
				target: 'map',
				view: new ol.View({
					center: defaultCenter,
					zoom: 6
				})
			});

			// Main control bar
			var mainBar = new ol.control.Bar();
			map.addControl(mainBar);

			// // Editbar
			// var editbar = new ol.control.EditBar({
			// 	source: vector.getSource(),
			// 	edition: true,
			// 	interactions: {
			// 		DrawPoint: false,
			// 		DrawLine: false,
			// 		DrawPolygon: true,
			// 		DrawHole: false,
			// 		DrawRegular: false,
			// 		Transform: false,
			// 		Info: false,
			// 		Split: false,
			// 		Offset: false
			// 	}
			// });
			// mainbar.addControl(editbar);

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
							vector.getSource().removeFeature(f);
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

			selectCtrl = new ol.control.Toggle({
				html: '<i class="fa-solid fa-arrow-pointer"></i>',
				title: "Select",
				interaction: new ol.interaction.Select({ hitTolerance: 2 }),
				bar: selectBar,
				autoActivate: true,
				active: true
			});
			editBar.addControl(selectCtrl);

			console.log(deleteBtn.setVisible)

			selectBar.setVisible(false);

			selectCtrl.getInteraction().on('change:active', function () {
				var features = selectCtrl.getInteraction().getFeatures();
				selectBar.setVisible(features.getLength() > 0);
			}.bind(editBar));

			modify = new ol.interaction.ModifyFeature({
				features: selectCtrl.getInteraction().getFeatures()
			})

			map.addInteraction(modify)
			// Activate with select
			modify.setActive(selectCtrl.getInteraction().getActive())
			selectCtrl.getInteraction().on('change:active', function () {
				modify.setActive(selectCtrl.getInteraction().getActive())
			}.bind(editBar));

			drawCtrl = new ol.control.Toggle({
				html: '<i class="fa-solid fa-draw-polygon"></i>',
				title: 'Polygon',
				interaction: new ol.interaction.Draw({
					type: 'Polygon',
					source: vector.getSource()
				})
			});
			editBar.addControl(drawCtrl);

			// // Undo redo interaction
			// var undoInteraction = new ol.interaction.UndoRedo();
			// map.addInteraction(undoInteraction);

			// // Add buttons to the bar
			// var bar = new ol.control.Bar({
			// 	group: true,
			// 	controls: [
			// 		new ol.control.Button({
			// 			html: '<i class="fa-solid fa-rotate-left"></i>',
			// 			title: 'Undo...',
			// 			handleClick: function () {
			// 				undoInteraction.undo();
			// 			}
			// 		}),
			// 		new ol.control.Button({
			// 			html: '<i class="fa-solid fa-rotate-right"></i>',
			// 			title: 'Redo...',
			// 			handleClick: function () {
			// 				undoInteraction.redo();
			// 			}
			// 		})
			// 	]
			// });
			// mainbar.addControl(bar);

			// /* undo/redo custom */
			// var style;
			// // Define undo redo for the style
			// undoInteraction.define(
			// 	'style',
			// 	// undo function: set previous style
			// 	function (s) {
			// 		style = s.before;
			// 		vector.changed();
			// 	},
			// 	// redo function: reset the style
			// 	function (s) {
			// 		style = s.after;
			// 		vector.changed();
			// 	}
			// );

			map.addInteraction(new ol.interaction.Snap({
				source: vector.getSource()
			}));

			draw = drawCtrl.getInteraction().on('drawend', async function (evt) {
				wkt = getFeatureWKT(evt.feature);
				await LS_WKTs.add(wkt).then(function (result) {
					centerOnFeature(evt.feature);
				});
			});

			// remove = editBar.getInteraction().on('deletestart', function (evt) {
			// 	console.log("deletestart", evt);
			// 	if (evt.features.getArray().length > 0) {
			// 		evt.features.getArray().forEach(function (feature) {
			// 			console.log(feature.getId());
			// 			LS_WKTs.remove(feature.getId());
			// 		});
			// 	}
			// });

			select = drawCtrl.getInteraction().on('select', function (evt) {

				console.log("select", evt);

				app.restoreDefaultColors();
				if (evt.deselected.length > 0) {
					evt.deselected.forEach(function (feature) {
						textarea.value = getFeatureWKT(feature);
						LS_WKTs.update(feature.getId(), textarea.value);

						var multi = featuresToMultiPolygon();
						var geo = multi.getGeometry().transform(projection_mercator, projection_geodetic);
						textarea.value = format.writeGeometry(geo);
					});
				}

				if (evt.selected.length > 0) {
					evt.selected.forEach(function (feature) {
						textarea.value = getFeatureWKT(feature);
					});
				}
			});
			// select.style_ = styles(editColor);

		},

		init: function () {
			var self = this;

			getLocation().then(location => {
				console.log("location", location);

				defaultCenter = ol.proj.transform([location.longitude, location.latitude], projection_geodetic, projection_mercator);

				self.prepareObjets();

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
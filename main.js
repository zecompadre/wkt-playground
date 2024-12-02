var app = (function () {

	class Translation {
		constructor() {
			this.language = navigator.language || 'en'; // Default to English if no language is detected
			switch (this.language) {
				case 'en-US':
				case 'en-GB':
					this.language = 'en';
					break;
				case 'fr-FR':
				case 'fr':
					this.language = 'fr';
					break;
				case 'es-ES':
				case 'es':
					this.language = 'es';
					break;
				case 'pt-PT':
				case 'pt':
					this.language = 'pt';
					break;
			}

			this.translations = {
				en: {
					changebutton: "Change layer...",
					centerobjects: "Center on map objects...",
					centeronmylocation: "Center in my location...",
					redo: 'Redo...',
					undo: 'Undo...',
					polygon: 'Polygon',
					showinfo: "Show information",
					delete: 'Delete',
					select: 'Select',
				},
				fr: {
					changebutton: "Changer de couche...",
					centerobjects: "Centrer sur les objets de la carte...",
					centeronmylocation: "Centrer sur ma position...",
					redo: 'Refaire...',
					undo: 'Annuler...',
					polygon: 'Polygone',
					showinfo: "Afficher les informations",
					delete: 'Supprimer',
					select: 'Sélectionner',
				},
				es: {
					changebutton: "Cambiar capa...",
					centerobjects: "Centrar en objetos del mapa...",
					centeronmylocation: "Centrar en mi ubicación...",
					redo: 'Rehacer...',
					undo: 'Deshacer...',
					polygon: 'Polígono',
					showinfo: "Mostrar información",
					delete: 'Eliminar',
					select: 'Seleccionar',
				},
				pt: {
					changebutton: "Alterar camada...",
					centerobjects: "Centralizar em objetos no mapa...",
					centeronmylocation: "Centralizar na minha localização...",
					redo: 'Refazer...',
					undo: 'Desfazer...',
					polygon: 'Polígono',
					showinfo: "Mostrar informações",
					delete: 'Excluir',
					select: 'Selecionar',
				}
			};

			this.setLanguage(this.language);
		}

		// Set language and update translations
		setLanguage(lang) {
			this.language = lang;
			this.updateContent();
		}

		// Get translation by key for the current language
		get(key) {
			if (this.translations[this.language] && this.translations[this.language][key]) {
				return this.translations[this.language][key];
			}
			return key; // Return the key itself if no translation is found
		}

		// Update content on the page
		updateContent() {
			const elementsToTranslate = document.querySelectorAll('[data-translate]');
			elementsToTranslate.forEach(element => {
				const key = element.getAttribute('data-translate');
				element.textContent = this.get(key);
			});
		}

		// Get the current language
		getCurrentLanguage() {
			return this.language;
		}
	}

	/**
	 * Class representing a loading overlay with animated bouncing dots.
	 */
	class Loading {
		/**
		 * Creates an instance of the Loading class.
		 * @param {Object} [options={}] - Configuration options for the loading overlay.
		 * @param {number} [options.dotCount=4] - Number of dots in the loading animation.
		 * @param {number} [options.dotSize=15] - Size of each dot in pixels.
		 * @param {number} [options.dotGap=10] - Gap between dots in pixels.
		 * @param {number} [options.animationDuration=1.4] - Duration of the bounce animation in seconds.
		 */
		constructor({ dotCount = 4, dotSize = 15, dotGap = 10, animationDuration = 1.4 } = {}) {
			/**
			 * Colors used for the dots.
			 * @type {string[]}
			 * @private
			 */
			this.colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

			/**
			 * Overlay element for the loading screen.
			 * @type {HTMLDivElement}
			 * @private
			 */
			this.overlay = document.createElement('div');
			Object.assign(this.overlay.style, {
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
				opacity: 0,
				transition: 'opacity 0.3s',
			});

			/**
			 * Container element for the dots.
			 * @type {HTMLDivElement}
			 * @private
			 */
			this.dotsContainer = document.createElement('div');
			Object.assign(this.dotsContainer.style, {
				display: 'flex',
				gap: `${dotGap}px`,
			});

			/**
			 * Array of dot elements.
			 * @type {HTMLDivElement[]}
			 * @private
			 */
			this.dots = [];
			for (let i = 0; i < dotCount; i++) {
				const dot = document.createElement('div');
				Object.assign(dot.style, {
					width: `${dotSize}px`,
					height: `${dotSize}px`,
					backgroundColor: this.colors[i % this.colors.length],
					borderRadius: '50%',
					animation: `bounce ${animationDuration}s ease-in-out infinite`,
					animationDelay: `${i * 0.2}s`,
				});
				this.dots.push(dot);
				this.dotsContainer.appendChild(dot);
			}

			// Add keyframe animation for bouncing dots
			const styleSheet = document.createElement('style');
			styleSheet.type = 'text/css';
			styleSheet.innerText = `
			@keyframes bounce {
				0%, 80%, 100% { transform: scale(0); }
				40% { transform: scale(1); }
			}
		`;
			document.head.appendChild(styleSheet);

			// Append dots container to overlay
			this.overlay.appendChild(this.dotsContainer);

			/**
			 * Visibility status of the overlay.
			 * @type {boolean}
			 * @private
			 */
			this.isVisible = false;
		}

		/**
		 * Shows the loading overlay.
		 */
		show() {
			if (this.isVisible) return;
			document.body.appendChild(this.overlay);
			requestAnimationFrame(() => {
				this.overlay.style.opacity = 1;
			});
			this.isVisible = true;
		}

		/**
		 * Hides the loading overlay.
		 */
		hide() {
			if (!this.isVisible) return;
			this.overlay.style.opacity = 0;
			this.overlay.addEventListener('transitionend', () => {
				if (this.overlay.parentNode) {
					document.body.removeChild(this.overlay);
				}
			}, { once: true });
			this.isVisible = false;
		}
	}

	const projections = {
		geodetic: 'EPSG:4326',
		mercator: 'EPSG:3857',
	};

	const colors = {
		normal: '#141414',
		create: '#00AAFF',
		edit: '#ec7063',
		snap: '#34495e',
	};

	const mapDefaults = {
		latitude: 39.6945,
		longitude: -8.1234,
		zoom: 6,
	};

	const loading = new Loading({ dotCount: 4, dotSize: 25 });

	const translator = new Translation();

	let map, attributionControl, vectorLayer, format, defaultCenter, userLocation, featureCollection, main, textarea, modifyInteraction, undoInteraction;

	let lfkey = "zecompadre-wkt";

	let mapControls = {};

	const arcgisLayer = new ol.layer.Tile({
		name: 'Satellite',
		title: 'Satellite',
		source: new ol.source.XYZ({
			url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			attributions: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
		}),
		visible: false,
	});

	const osmLayer = new ol.layer.Tile({
		name: 'Streets',
		title: 'Streets',
		source: new ol.source.OSM(),
		visible: true
	});

	const utilities = {
		/**
		 * Transforms coordinates from one spatial reference system to another.
		 *
		 * This function uses OpenLayers' `ol.proj.transform` method to convert the given coordinates
		 * from one projection to another (e.g., from Mercator to Geodetic).
		 *
		 * @param {Array<number>} coords - The coordinates to be transformed, represented as an array [x, y].
		 * @param {string} from - The source projection's EPSG code (e.g., 'EPSG:3857' for Web Mercator).
		 * @param {string} to - The target projection's EPSG code (e.g., 'EPSG:4326' for WGS 84).
		 * @returns {Array<number>} - The transformed coordinates as an array [x, y].
		 */
		transformCoordinates: (coords, from, to) => ol.proj.transform(coords, from, to),
		/**
		 * Generates HTML for a button image that represents the current visible map layer.
		 *
		 * This function checks which layer (OSM or ArcGIS) is currently visible, retrieves the corresponding
		 * preview image and title, and returns an HTML image element to switch between layers.
		 * 
		 * @returns {string} - The HTML string representing an image button for the visible map layer.
		 */
		layerChangeBtnHtml: () => {
			// Extract common information for OSM and ArcGIS layers
			const osmTitle = osmLayer.get("title") || osmLayer.get("name"); // Fallback to 'name' if 'title' is not available
			const osmImg = osmLayer.getPreview(); // Get OSM layer preview image
			const arcgisTitle = arcgisLayer.get("title") || arcgisLayer.get("name"); // Fallback to 'name' if 'title' is not available
			const arcgisImg = arcgisLayer.getPreview(); // Get ArcGIS layer preview image

			// Determine which layer is currently visible
			const isOsmVisible = osmLayer.getVisible(); // Check if OSM layer is visible
			const imgSrc = isOsmVisible ? arcgisImg : osmImg; // Choose the image based on visible layer
			const imgAlt = isOsmVisible ? arcgisTitle : osmTitle; // Set alternative text based on visible layer
			const imgTitle = imgAlt; // Use the same text for title attribute

			// Return the HTML for the button with the corresponding layer
			return `<img src="${imgSrc}" width="36" height="36" alt="${imgAlt}" title="${imgTitle}" />`;
		},
		/**
		 * Converts a hexadecimal color code to an RGBA color string.
		 *
		 * This function takes a hexadecimal color code (e.g., "#FF5733") and an optional opacity value,
		 * and returns the corresponding RGBA color string with the specified opacity.
		 *
		 * @param {string} hex - The hexadecimal color code, e.g., "#FF5733".
		 * @param {string} [opacity='0.2'] - The opacity level for the color, default is '0.2'.
		 * @returns {string} - The RGBA color string in the format 'rgba(r, g, b, opacity)'.
		 */
		hexToRgbA: (hex, opacity = '0.2') => {
			// Remove the '#' from the hex code if present and parse it to a number
			const bigint = parseInt(hex.replace(/^#/, ''), 16);

			// Extract the red, green, and blue components using bitwise operations
			const r = (bigint >> 16) & 255; // Extract the first 8 bits (red)
			const g = (bigint >> 8) & 255;  // Extract the next 8 bits (green)
			const b = bigint & 255;         // Extract the last 8 bits (blue)

			// Return the color in RGBA format with the specified opacity
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		},
		/**
		 * Converts the geometry of a feature to Well-Known Text (WKT) format.
		 *
		 * This function retrieves the geometry of the provided feature, clones it to prevent 
		 * modification of the original geometry, transforms it from Mercator to Geodetic projection, 
		 * and then returns the WKT representation of the transformed geometry.
		 *
		 * @param {Object} feature - The feature object that contains the geometry to be converted.
		 * @param {Object} feature.getGeometry - Method that returns the geometry of the feature.
		 * @returns {string} - The WKT representation of the feature's geometry after transformation.
		 */
		getFeatureWKT: (feature) => {
			// Return an empty string if the feature is undefined or null
			if (!feature) return "";

			// Clone the geometry of the feature to avoid modifying the original
			const geom = feature.getGeometry().clone();

			// Transform the geometry from Mercator to Geodetic projection
			const transformedGeom = geom.transform(projections.mercator, projections.geodetic);

			// Convert the transformed geometry to WKT (Well-Known Text) format
			return format.writeGeometry(transformedGeom);
		},
		/**
		 * Generates a SHA-256 checksum for the given input string.
		 *
		 * @param {string} input - The input string to hash.
		 * @returns {Promise<string>} - The hexadecimal representation of the SHA-256 checksum.
		 */
		generateChecksum: async (input) => {
			// Return the input as-is if it is null or undefined
			if (!input) return input;

			// Encode the input string into a Uint8Array using UTF-8 encoding
			const encoder = new TextEncoder();
			const data = encoder.encode(input);

			// Calculate the SHA-256 hash as an ArrayBuffer
			const hashBuffer = await crypto.subtle.digest('SHA-256', data);

			// Convert the ArrayBuffer to a hexadecimal string
			return Array.from(new Uint8Array(hashBuffer)) // Create an array from the hash bytes
				.map(byte => byte.toString(16).padStart(2, '0')) // Convert each byte to a two-character hex string
				.join(''); // Join all hex strings into a single result
		},
		/**
		 * Creates and initializes a new vector layer with specified features and style.
		 *
		 * This function creates a new vector layer using OpenLayers' `ol.layer.Vector`. The layer is populated
		 * with features from a provided feature collection and styled using a generic style function.
		 * The layer is also set to not be displayed in the layer switcher.
		 *
		 * @returns {void} This function does not return anything.
		 */
		createVectorLayer: () => {
			vectorLayer = new ol.layer.Vector({
				source: new ol.source.Vector({ features: featureCollection }), // Set the features in the vector source
				style: utilities.genericStyleFunction(colors.normal), // Apply a style function to the layer
			});
			vectorLayer.set('displayInLayerSwitcher', false); // Prevent the layer from appearing in the layer switcher
		},
		/**
		 * Creates a customized attribution control for the map.
		 * 
		 * This function initializes an OpenLayers `Attribution` control, sets it to be collapsible,
		 * and customizes the button icon to display an information symbol using Font Awesome.
		 * 
		 * @returns {void}
		 */
		createAttributeControl: function () {
			// Initialize the attribution control with the collapsible option enabled
			attributionControl = new ol.control.Attribution({
				collapsible: true, // Allows the control to be collapsed
			});

			// Customize the button within the control to display an information icon
			const buttonElement = attributionControl.element.querySelector('button');
			if (buttonElement) {
				buttonElement.innerHTML = '<i class="fa-solid fa-circle-info fa-lg"></i>';
			} else {
				console.warn('Attribution control button element not found.');
			}
		},
		modifyStyleFunction: (color) => {

			return function (feature, segments) {
				// Style for Real Vertices
				const styles = utilities.genericStyleFunction(color);

				//console.log(feature, { color: '#007BFF', icon: '🔥' });
				// console.log(segments, { color: '#007BFF', icon: '🔥' });

				// // Add Virtual Vertices (Midpoints)
				// segments.forEach((segment) => {
				// 	const midpoint = [
				// 		(segment[0][0] + segment[1][0]) / 2,
				// 		(segment[0][1] + segment[1][1]) / 2,
				// 	];
				// 	styles.push(
				// 		new Style({
				// 			geometry: new Point(midpoint),
				// 			image: new ol.style.Circle({
				// 				radius: 5,
				// 				fill: new ol.style.Fill({ color: 'red' }),
				// 			}),
				// 		})
				// 	);
				// });

				return styles;
			};
		},
		/**
		 * Generates a style for a vector feature with a circle marker and custom color.
		 *
		 * This function creates a style object for a vector feature using OpenLayers' `ol.style.Style`. 
		 * The style includes a circle marker with a fill and stroke, both of which use the specified color.
		 * It also applies a semi-transparent fill to the feature and a stroke with a defined color and width.
		 *
		 * @param {string} color - The color to apply to the style, in hexadecimal format (e.g., '#FF5733').
		 * @returns {Array<ol.style.Style>} - An array containing an OpenLayers style for the feature.
		 */
		genericStyleFunction: (color) => [
			new ol.style.Style({
				image: new ol.style.RegularShape({
					fill: new ol.style.Fill({ color: colors.normal }),
					stroke: new ol.style.Stroke({ color: colors.normal, width: 3 }),
					points: 4, // Square shape
					radius: 10, // Size of the shape
					radius2: 0, // Inner radius (smaller)
					angle: 0, // No rotation
				}),
				fill: new ol.style.Fill({ color: utilities.hexToRgbA(color, '0.3') }), // Apply a semi-transparent fill for the feature
				stroke: new ol.style.Stroke({ color, width: 2 }), // Apply stroke color and width to the feature
			}),
		],
		/**
		 * Generates a style function for vector features based on their geometry type and a specified color.
		 *
		 * This function returns a style for vector features (Point, LineString, Polygon) depending on the
		 * geometry type of the feature. The style includes custom stroke, fill, and shape properties. 
		 * The color of the style is customizable. If no color is provided, a default color is used.
		 *
		 * @param {string} color - The color to apply to the style, in hexadecimal format (e.g., '#FF5733').
		 * @returns {Function} - A function that returns the appropriate style for a feature based on its geometry type.
		 *                        The returned function accepts a feature and returns an array of styles.
		 */
		drawStyleFunction: (color) => {
			return function (feature) {
				var geometry = feature.getGeometry();
				color = color || colors.normal; // Default color if no color is provided

				if (geometry.getType() === 'LineString') {
					var styles = [
						new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: utilities.hexToRgbA(color, '1'),
								width: 3
							})
						})
					];
					return styles;
				}

				if (geometry.getType() === 'Point') {
					var styles = [
						new ol.style.Style({
							image: new ol.style.RegularShape({
								fill: new ol.style.Fill({ color: colors.normal }),
								stroke: new ol.style.Stroke({ color: colors.normal, width: 3 }),
								points: 4, // Square shape
								radius: 10, // Size of the shape
								radius2: 0, // Inner radius (smaller)
								angle: 0, // No rotation
							}),
						})
					];
					return styles;
				}

				if (geometry.getType() === 'Polygon') {
					var styles = [
						new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: utilities.hexToRgbA(color, 0),
								width: 3
							}),
							fill: new ol.style.Fill({
								color: utilities.hexToRgbA(color, '0.3')
							})
						})
					];
					return styles;
				}

				return false; // Return false if geometry type is not recognized
			};
		},
		/**
		 * Restores the default border and background colors for the textarea element.
		 *
		 * This function resets the border color and background color of the textarea to their default values.
		 * It removes any custom styling applied to these properties, allowing the browser's default styling to take effect.
		 *
		 * @returns {void} This function does not return any value.
		 */
		restoreDefaultColors: function () {
			textarea.style.borderColor = ""; // Reset border color to default
			textarea.style.backgroundColor = ""; // Reset background color to default
		},
		/**
		 * Fetches the public IP address of the client using the ipify API.
		 *
		 * This asynchronous function makes a request to the ipify API to retrieve the client's public IP address.
		 * If the request is successful, it returns the IP address. If there is an error (e.g., network failure),
		 * it logs the error and returns a fallback message.
		 *
		 * @returns {Promise<string>} A promise that resolves to the public IP address as a string, or a fallback
		 *                            message if an error occurs during the fetch operation.
		 */
		getIP: async function () {
			try {
				// Using ipify.org as an example API to fetch the public IP address
				const response = await fetch('https://api.ipify.org?format=json');

				if (!response.ok) {
					throw new Error('Failed to fetch IP address');
				}

				const data = await response.json();
				return data.ip;
			} catch (error) {
				console.error('Error fetching IP:', error); // Log error to the console
				return 'Unable to retrieve IP address'; // Return fallback message on error
			}
		},
		/**
		 * Retrieves the user's current geographical location (latitude and longitude).
		 *
		 * This asynchronous function checks if geolocation is available in the user's browser. If available,
		 * it retrieves the user's current position using the `navigator.geolocation` API. If successful, it resolves
		 * with an object containing the latitude and longitude (rounded to 4 decimal places). If there is an error,
		 * it rejects with an appropriate error message.
		 *
		 * @returns {Promise<Object>} A promise that resolves with an object containing `latitude` and `longitude` properties
		 *                            (both rounded to 4 decimal places), or rejects with an error message if geolocation fails.
		 */
		getLocation: async function () {
			return new Promise((resolve, reject) => {
				// Check if geolocation is available
				if (!navigator.geolocation) {
					reject('Geolocation is not supported by your browser');
					return;
				}

				// Handle errors related to geolocation
				function handleError(error) {
					switch (error.code) {
						case error.PERMISSION_DENIED:
							reject('User denied the request for Geolocation');
							break;
						case error.POSITION_UNAVAILABLE:
							reject('Location information is unavailable');
							break;
						case error.TIMEOUT:
							reject('The request to get user location timed out');
							break;
						case error.UNKNOWN_ERROR:
							reject('An unknown error occurred while retrieving coordinates');
							break;
					}
					reject('Error getting location');
				}

				// Get current position
				navigator.geolocation.getCurrentPosition(
					(position) => {
						resolve({
							latitude: position.coords.latitude.toFixed(4),  // Round latitude to 4 decimal places
							longitude: position.coords.longitude.toFixed(4), // Round longitude to 4 decimal places
						});
					},
					handleError // Handle geolocation error
				);
			});
		},
		/**
		 * Captures a screenshot of the map element and appends it as an image to the body of the document.
		 *
		 * This function uses the `domtoimage` library to generate a PNG image of the map element (identified by the "map" ID).
		 * The image is created with the current dimensions of the map. If the screenshot is successfully created, it is
		 * appended to the document body as an image. If an error occurs during the process, it logs the error to the console.
		 *
		 * @param {Object} feature - The feature associated with the map (currently unused, but could be extended for specific use cases).
		 * @returns {void} This function does not return any value.
		 */
		imageCanvas: function (feature) {
			// Get the map element and its dimensions
			const map = document.getElementById("map");
			const width = map.offsetWidth;
			const height = map.offsetHeight;
			loading.show(); // Show the loading overlay while generating the image
			// Use domtoimage to capture a PNG image of the map
			domtoimage.toPng(map, {
				"width": width,
				"height": height
			})
				.then(function (dataUrl) {
					// Create an image element and set its source to the data URL
					var img = new Image();
					img.src = dataUrl;

					// Append the image to the body of the document
					document.body.appendChild(img);
					loading.hide(); // Hide the loading overlay once the image is generated
				})
				.catch(function (error) {
					// Log any errors that occur during the image generation
					console.error('oops, something went wrong!', error);
					loading.hide(); // Hide the loading overlay if an error occurs
				});
		}

	};

	const featureUtilities = {
		/**
		 * Deselects the currently selected feature if any. 
		 * If `active` is false, the selection state is toggled.
		 * 
		 * @param {boolean} active - If true, the selection state remains active; if false, the selection state is toggled.
		 * @returns {void} This method does not return a value.
		 */
		deselectCurrentFeature: (active) => {
			const selectInteraction = mapControls.selectCtrl.getInteraction();
			let conditionSelection = selectInteraction.getActive(); // Get the current selection state

			// Toggle the selection state if active is false
			if (!active) {
				conditionSelection = !conditionSelection;
			}

			const selectedFeatures = selectInteraction.getFeatures(); // Get the collection of selected features

			// If selection is active and features are selected
			if (conditionSelection && selectedFeatures.getArray().length > 0) {
				const activeFeature = selectedFeatures.item(0); // Get the first selected feature
				selectInteraction.dispatchEvent({
					type: 'select',
					selected: [],
					deselected: [activeFeature] // Deselect the feature
				});

				selectedFeatures.remove(activeFeature); // Remove the active feature from the selection
			}
		},
		/**
		 * Creates a MultiPolygon geometry from all features in the vector layer and writes its WKT 
		 * representation to the textarea.
		 * 
		 * This method retrieves the features from the vector layer, filters for geometries of type 
		 * Polygon or MultiPolygon, and combines them into a MultiPolygon. It then transforms the 
		 * geometry from Mercator to Geodetic projection and writes the resulting WKT string to the 
		 * textarea input.
		 * 
		 * @returns {void} This method does not return a value. It modifies the textarea input value.
		 */
		createFromAllFeatures: () => {
			const multi = featureUtilities.featuresToMultiPolygon(); // Get MultiPolygon geometry from all features
			if (multi) {
				const geo = multi.getGeometry().transform(projections.mercator, projections.geodetic); // Transform the geometry to Geodetic
				textarea.value = format.writeGeometry(geo); // Write the WKT representation to textarea
			} else {
				console.warn('No valid polygons or multipolygons found to create a MultiPolygon.');
			}
		},
		/**
		 * Centers and zooms the map view to fit the provided feature's geometry.
		 * 
		 * This function calculates the extent of the feature's geometry, determines its center point, 
		 * and updates the map view to center on that point. It also adjusts the map's zoom level 
		 * to fit the entire extent of the feature within the map's viewport with optional padding.
		 * 
		 * @param {ol.Feature} feature - The OpenLayers feature to center the map on.
		 * @returns {void} This method does not return any value. It modifies the map view directly.
		 */
		centerOnFeature: (feature) => {
			if (!feature) {
				console.error('Feature is required to center the map.');
				return;
			}

			const geometry = feature.getGeometry();
			const extent = geometry.getExtent(); // Get the geometry extent (bounding box)
			const center = ol.extent.getCenter(extent); // Get the center of the extent

			// Set the center of the map view to the calculated center
			map.getView().setCenter(center);

			// Fit the map view to the extent, with padding around the feature
			map.getView().fit(extent, { size: map.getSize(), padding: [50, 50, 50, 50] });
		},
		/**
		 * Centers and zooms the map view to fit all features within the specified vector layer's extent.
		 * 
		 * This function calculates the extent of all features within the provided vector layer's source,
		 * and adjusts the map view to center on that extent. It also modifies the zoom level to fit all 
		 * features within the map's viewport, with optional padding around the features.
		 * 
		 * @param {ol.layer.Vector} vector - The OpenLayers vector layer whose features will be centered.
		 * @returns {void} This method does not return any value. It modifies the map view directly.
		 */
		centerOnVector: (vector) => {
			// Check if there are any features in the vector source before proceeding
			if (mapUtilities.getFeatureCount() > 0) {
				const source = vectorLayer.getSource(); // Get the source of the vector layer

				// Calculate the extent (bounding box) of all features in the source
				const extent = source.getExtent();

				// Fit the map view to the calculated extent, with optional padding around the features
				map.getView().fit(extent, {
					size: map.getSize(), // Use the current map size for the best fit
					padding: [50, 50, 50, 50], // Optional padding around the extent
				});
			}
		},
		/**
		 * Converts all Polygon and MultiPolygon features in the vector layer to a MultiPolygon feature.
		 * 
		 * This function filters all features of type `Polygon` and `MultiPolygon` from the vector layer's source.
		 * It combines them into a single `MultiPolygon` feature. If there is only one polygon, it returns a 
		 * single `Polygon` feature. The function transforms the geometries to ensure they are in the correct 
		 * format before returning the final result.
		 * 
		 * @returns {ol.Feature|null} A MultiPolygon feature containing all filtered polygons, or null if no polygons are found.
		 */
		featuresToMultiPolygon: () => {
			// Get all features from the vector layer source
			const features = vectorLayer.getSource().getFeatures();

			// Filter for features of type 'Polygon' or 'MultiPolygon'
			const polygons = features.filter((f) =>
				['Polygon', 'MultiPolygon'].includes(f.getGeometry().getType())
			);

			// If no polygons were found, return null
			if (polygons.length === 0) return null;

			// Extract geometries from the filtered polygons
			const geometries = polygons.map((f) => f.getGeometry());

			// If only one polygon is found, return it as a Polygon feature
			if (geometries.length === 1) {
				return new ol.Feature(
					new ol.geom.Polygon(geometries[0].getCoordinates())
				);
			}

			// Otherwise, combine the geometries into a MultiPolygon and return
			return new ol.Feature(
				new ol.geom.MultiPolygon(
					geometries.map((g) => g.getCoordinates())  // Flatten all coordinates into a MultiPolygon
				)
			);
		},
		/**
		 * Removes the current vector layer (if it exists), creates a new vector layer, 
		 * and then adds it to the map.
		 * 
		 * This function handles the process of clearing any existing vector layer and 
		 * replacing it with a newly created vector layer. It ensures that the map displays
		 * the most up-to-date features. If the vector layer creation fails, an error is logged.
		 * 
		 * @async
		 * @returns {Promise<void>} A promise that resolves once the vector layer is added to the map.
		 */
		addFeatures: async () => {
			try {
				// If a vector layer exists, remove it from the map
				if (vectorLayer) {
					map.removeLayer(vectorLayer);
				}

				// Create a new vector layer and add it to the map
				utilities.createVectorLayer();

				// If vectorLayer exists after creation, add it to the map
				if (vectorLayer) {
					map.addLayer(vectorLayer);
				} else {
					// Log error if vector layer creation fails
					console.error("Failed to create the 'vector' layer. Please check the createVector function.");
				}
			} catch (error) {
				// Log any unexpected errors that may occur during the process
				console.error("Error while adding features to the map:", error);
			}
		},
		/**
		 * Adds a new feature to the collection from a provided WKT (Well-Known Text) string.
		 * 
		 * This function attempts to read the WKT string, transform the geometry coordinates
		 * from geodetic to mercator, and then adds the feature to the collection if valid.
		 * If the WKT string is empty or invalid, it highlights the textarea and does not add
		 * the feature to the collection.
		 * 
		 * @param {string} id - The unique identifier for the feature to be added.
		 * @param {string} [wkt] - The Well-Known Text (WKT) string representing the feature geometry.
		 *                            If not provided, the function will use the value from the textarea.
		 * 
		 * @returns {void}
		 */
		addToFeatures: function (id, wkt) {
			let newFeature;
			const wktString = wkt || textarea.value;

			// Check if WKT string is empty
			if (wktString === "") {
				textarea.style.borderColor = "red";
				textarea.style.backgroundColor = "#F7E8F3";
				return; // Early exit if WKT string is empty
			}

			// Attempt to read the WKT string and create a feature
			try {
				newFeature = format.readFeature(wktString);
			} catch (err) {
				console.error('Error reading WKT:', err);
				textarea.style.borderColor = "red";
				textarea.style.backgroundColor = "#F7E8F3";
				return; // Exit if there was an error parsing WKT
			}

			// If no feature is created, indicate an error
			if (!newFeature) {
				textarea.style.borderColor = "red";
				textarea.style.backgroundColor = "#F7E8F3";
				return;
			}

			// Transform the feature geometry from geodetic to mercator projection
			newFeature.getGeometry().transform(projections.geodetic, projections.mercator);

			// Set the feature's unique ID and add it to the feature collection
			newFeature.setId(id);
			featureCollection.push(newFeature);

			// Reset the textarea style on successful feature addition
			textarea.style.borderColor = "";
			textarea.style.backgroundColor = "";
		}
	};

	const mapUtilities = {
		/**
		 * Toggles the visibility of OSM and ArcGIS layers on the map.
		 * 
		 * This function switches the visibility state of two predefined layers (`osmLayer` and `arcgisLayer`).
		 * It ensures only one of the layers is visible at a time and updates the HTML content of the layer change button.
		 * 
		 * @returns {void}
		 */
		toggleLayers: function () {
			try {
				// Get the current visibility state of the OSM layer
				const osmVisible = osmLayer.getVisible();

				// Toggle the visibility of OSM and ArcGIS layers
				osmLayer.setVisible(!osmVisible); // OSM: toggle visibility
				arcgisLayer.setVisible(osmVisible); // ArcGIS: opposite visibility

				// Update the HTML of the layer change button
				if (mapControls.layerChangeBtn) {
					mapControls.layerChangeBtn.setHtml(utilities.layerChangeBtnHtml());
				} else {
					console.warn("Layer change button control is not available.");
				}
			} catch (error) {
				console.error("Error toggling layers:", error);
			}
		},

		/**
		 * Reviews and updates the layout of the map and controls based on the current feature count.
		 * 
		 * - Updates UI elements (e.g., classes and control visibility) depending on whether features are present.
		 * - Centers the map view if `center` is true and features exist.
		 * - Always updates the map size after layout adjustments.
		 * 
		 * @async
		 * @param {boolean} center - Whether to center the map on features if they exist.
		 * @returns {Promise<void>} Resolves after the layout and optional centering are completed.
		 */
		reviewLayout: async function (center) {
			try {
				const featureCount = mapUtilities.getFeatureCount();

				if (featureCount > 0) {
					// Features exist: update layout and controls accordingly
					main.classList.remove("nowkt");
					featureUtilities.createFromAllFeatures();
					mapControls.centerObjectsBtn.setVisible(true);
				} else {
					// No features: adjust layout and hide controls
					main.classList.add("nowkt");
					mapControls.selectBar.setVisible(false);
					mapControls.centerObjectsBtn.setVisible(false);
				}

				if (center && featureCount > 0) {
					// Center the map if requested and features exist
					await mapUtilities.center();
				}

				// Ensure the map's layout is updated
				map.updateSize();
			} catch (error) {
				console.error("Error in reviewLayout function:", error);
			}
		},

		/**
		 * Centers the map view based on the extent of features in the collection or resets to the default center if no features exist.
		 * @async
		 */
		center: async function () {
			try {
				if (!main.classList.contains("nowkt") && featureCollection.getLength() > 0) {
					// Create an empty extent and calculate the combined extent of all features
					const extent = ol.extent.createEmpty();
					featureCollection.forEach(feature => {
						ol.extent.extend(extent, feature.getGeometry().getExtent());
					});

					// Fit the map view to the extent of the features
					map.getView().fit(extent, {
						size: map.getSize(),
						padding: [50, 50, 50, 50], // Add padding around the extent
					});
				} else {
					// Reset to the default center and zoom level
					map.getView().setCenter(defaultCenter);
					map.getView().setZoom(16);
				}
			} catch (error) {
				console.error("Error centering the map:", error);
			}
		},

		/**
		 * Gets the count of features in the vector layer on the map.
		 * @returns {number} - The number of features in the vector layer, or 0 if no vector layer exists.
		 */
		getFeatureCount: function () {
			try {
				// Find the first vector layer in the map's layer array
				const vectorLayer = map.getLayers().getArray().find(layer => layer instanceof ol.layer.Vector);

				// Return 0 if no vector layer is found
				if (!vectorLayer) {
					console.warn('No vector layer found on the map.');
					return 0;
				}

				// Get features from the vector layer's source and return their count
				const features = vectorLayer.getSource().getFeatures();
				return features.length;
			} catch (error) {
				console.error('Error retrieving feature count:', error);
				return 0;
			}
		},

		/**
		 * Loads WKT entries, checks for existing ones, and adds new ones if necessary.
		 * @param {boolean} [readcb=false] - If true, reads WKT from clipboard before processing.
		 * @returns {Promise<void>} - An asynchronous function that updates the map and layout.
		 */
		loadWKTs: async function (readcb = false) {
			const self = this; // Capture the correct context

			try {
				// Load existing WKT entries from localStorage
				wktUtilities.load();
				let wkts = wktUtilities.get();

				// Focus on textarea to prepare for possible WKT paste
				textarea.focus();

				let wkt = readcb ? await wktUtilities.readClipboard() : "";

				// Generate checksum for the WKT string
				const checksum = await utilities.generateChecksum(wkt);

				// Ensure wkts is an array
				if (!Array.isArray(wkts)) {
					wkts = [];
				}

				// Check for existing WKT entries and add them to features
				let exists = false;
				wkts.forEach(item => {
					if (checksum && item.id === checksum) {
						exists = true;
					}
					featureUtilities.addToFeatures(item.id, item.wkt);
				});

				// Add the new WKT if it doesn't exist
				if (wkt && !exists) {
					wkts.push({ id: checksum, wkt });
					featureUtilities.addToFeatures(checksum, wkt);
				}

				// Save the updated WKT list
				map.set("wkts", wkts);
				wktUtilities.save();

				// Add features to the map and review layout
				await featureUtilities.addFeatures();
				await self.reviewLayout(true);

			} catch (error) {
				console.error('Error loading WKTs:', error);
			}
		}

	};

	/**
	 * Utility functions for handling WKT (Well-Known Text) operations,
	 * including saving, loading, removing, updating, and interacting with the clipboard.
	 */
	const wktUtilities = {
		/**
		 * Loads WKT data from localStorage into the map.
		 */
		load: function () {
			const wkts = localStorage.getItem(lfkey) || "[]";
			map.set("wkts", JSON.parse(wkts));
		},

		/**
		 * Removes a WKT entry from the map by its ID.
		 * @param {string} id - The ID of the WKT to remove.
		 */
		remove: function (id) {
			let wkts = map.get("wkts");
			wkts = wkts.filter((item) => item.id !== id);
			map.set("wkts", wkts);
			this.save();
		},

		/**
		 * Saves the current WKT data from the map into localStorage.
		 */
		save: function () {
			localStorage.setItem(lfkey, JSON.stringify(this.get()));
		},

		/**
		 * Adds a new WKT entry for a given feature after generating a checksum to ensure uniqueness.
		 * Assigns the checksum as the feature's ID.
		 * @param {ol.Feature} feature - The OpenLayers feature to add.
		 * @async
		 */
		add: async function (feature) {
			try {
				// Convert the feature into its WKT representation
				const wkt = utilities.getFeatureWKT(feature);

				if (!wkt) {
					throw new Error("Feature WKT is undefined or invalid.");
				}

				// Generate a checksum for the WKT
				const checksum = await utilities.generateChecksum(wkt);

				// Retrieve current WKTs from the map or initialize an empty array
				const wkts = map.get("wkts") || [];

				// Check if the WKT already exists based on the checksum
				const exists = wkts.some((item) => item.id === checksum);

				// Set the checksum as the feature's ID
				feature.setId(checksum);

				// Add the new WKT to the collection if it does not already exist
				if (!exists) {
					wkts.push({ id: checksum, wkt });
					map.set("wkts", wkts); // Update the map's WKT collection
					this.save(); // Persist changes to localStorage
				}
			} catch (error) {
				console.error("Error adding WKT:", error.message);
			}
		},

		/**
		 * Retrieves all WKT entries from the map.
		 * @returns {Array} - An array of WKT objects.
		 */
		get: function () {
			return map.get("wkts") || [];
		},

		/**
		 * Updates an existing WKT entry by ID.
		 * @param {string} id - The ID of the WKT to update.
		 * @param {string} wkt - The updated WKT string.
		 */
		update: function (id, wkt) {
			const wkts = map.get("wkts") || [];
			wkts.forEach((item) => {
				if (item.id === id) {
					item.wkt = wkt;
				}
			});
			map.set("wkts", wkts);
			this.save();
		},

		/**
		 * Reads text from the clipboard, focusing on text containing "POLYGON".
		 * @async
		 * @returns {string} - The WKT string from the clipboard, or an empty string if not found.
		 */
		readClipboard: async function () {
			let returnVal = "";
			try {
				textarea.focus();
				const permission = await navigator.permissions.query({ name: "clipboard-read" });

				if (permission.state === "denied") {
					throw new Error("Not allowed to read clipboard.");
				}

				const text = await navigator.clipboard.readText();
				if (text.includes("POLYGON")) {
					returnVal = text;
					await navigator.clipboard.writeText(""); // Clear clipboard
				}
			} catch (error) {
				console.error("Error reading clipboard:", error.message);
			}
			return returnVal;
		},

		/**
		 * Adds a WKT entry from an element's value, then reloads the WKTs into the map.
		 * @param {HTMLTextAreaElement} ele - The HTML element containing the WKT value.
		 * @async
		 */
		paste: async () => {
			try {
				await mapUtilities.loadWKTs(true);
				await mapUtilities.reviewLayout(true);
			} catch (error) {
				console.error("Error pasting WKT:", error);
			}
		},
	};

	/**
	 * Sets up the map with its layers, controls, and default configuration.
	 */
	function setupMap() {
		// Cache essential DOM elements
		main = document.querySelector(".maincontainer");
		textarea = document.querySelector("#wktdefault textarea");

		// Initialize WKT format parser and feature collection
		format = new ol.format.WKT();
		featureCollection = new ol.Collection();

		// Set default center with transformed coordinates
		defaultCenter = utilities.transformCoordinates(
			[mapDefaults.longitude, mapDefaults.latitude],
			projections.geodetic,
			projections.mercator
		);

		// Initialize layers and controls
		utilities.createVectorLayer(); // Create the vector layer
		utilities.createAttributeControl(); // Create the attribution control

		// Configure the map
		map = new ol.Map({
			target: 'map', // Target container ID
			layers: [
				osmLayer,      // OpenStreetMap layer
				arcgisLayer,   // ArcGIS layer
				vectorLayer    // Vector layer for user features
			],
			controls: ol.control.defaults.defaults({ attribution: false }) // Disable default attribution
				.extend([attributionControl]), // Add custom attribution control
			view: new ol.View({
				center: defaultCenter,       // Set the initial center
				zoom: mapDefaults.zoom,      // Set the initial zoom level
				maxZoom: 19                  // Set the maximum zoom level
			}),
		});

		const tooltip = new ol.Overlay({
			element: document.getElementById('tooltip'),
			offset: [15, 15],
			positioning: 'bottom-left',
		});
		map.addOverlay(tooltip);

		map.on('pointermove', function (event) {
			const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
				return feature;
			});

			if (feature) {
				// Calculate area of the polygon in square meters
				const areaInSquareMeters = ol.sphere.getArea(feature.getGeometry());

				// Convert to square feet
				//const areaInSquareFeet = areaInSquareMeters * 10.7639;

				// Display the area in the tooltip
				tooltip.setPosition(event.coordinate);
				tooltip.getElement().innerHTML = `Area: ${areaInSquareMeters.toFixed(2)} m²`;
				tooltip.getElement().style.display = 'block';
				tooltip.getElement().classList.add('fade-in'); // Apply fade-in effect
			} else {
				tooltip.getElement().style.display = 'none';
			}
		});

		// Add additional controls and interactions
		initializeMapControls(); // Function to initialize map controls
	}

	/**
	 * Initializes the map controls and interactions.
	 * Sets up tools for drawing, selecting, modifying, undoing/redoing, and centering on features or user location.
	 */
	function initializeMapControls() {
		// Add basic map interactions
		map.addInteraction(new ol.interaction.DragPan({ condition: () => true }));
		map.addInteraction(new ol.interaction.MouseWheelZoom({ condition: () => true }));

		// Main control bar setup
		const mainBar = createControlBar('mainbar');
		map.addControl(mainBar);
		mapControls.mainBar = mainBar;

		// Edit control bar setup
		const editBar = createControlBar('editbar', true, false);
		mainBar.addControl(editBar);
		mapControls.editBar = editBar;

		// Selection controls and buttons
		const selectBar = createControlBar();
		mapControls.selectBar = selectBar;

		const selectCtrl = createSelectControl(selectBar);
		editBar.addControl(selectCtrl);
		mapControls.selectCtrl = selectCtrl;

		const deleteBtn = createDeleteButton();
		selectBar.addControl(deleteBtn);
		mapControls.deleteBtn = deleteBtn;

		const infoBtn = createInfoButton();
		//selectBar.addControl(infoBtn);
		mapControls.infoBtn = infoBtn;

		selectBar.setVisible(false);

		// Draw control setup
		const drawCtrl = createDrawControl();
		editBar.addControl(drawCtrl);
		mapControls.drawCtrl = drawCtrl;

		// Modify interaction setup
		const modifyInteraction = createModifyInteraction(selectCtrl);
		map.addInteraction(modifyInteraction);
		mapControls.modifyInteraction = modifyInteraction;

		drawCtrl.getInteraction().on('change:active', function (evt) {
			featureUtilities.deselectCurrentFeature(false);
		}.bind(editBar));

		modifyInteraction.setActive(selectCtrl.getInteraction().getActive())
		selectCtrl.getInteraction().on('change:active', function (evt) {
			modifyInteraction.setActive(selectCtrl.getInteraction().getActive())
		}.bind(editBar));

		// Undo/Redo interaction
		const undoInteraction = new ol.interaction.UndoRedo();
		map.addInteraction(undoInteraction);
		mapControls.undoInteraction = undoInteraction;

		// Undo/Redo buttons
		const undoBtn = createUndoButton(undoInteraction);
		const redoBtn = createRedoButton(undoInteraction);
		editBar.addControl(undoBtn);
		mapControls.undoBtn = undoBtn;
		editBar.addControl(redoBtn);
		mapControls.redoBtn = redoBtn;

		// Location and center controls
		const locationBar = createControlBar('locationbar');
		mainBar.addControl(locationBar);
		mapControls.locationBar = locationBar;

		const locationBtn = createLocationButton();
		locationBar.addControl(locationBtn);
		mapControls.locationBtn = locationBtn;

		const centerObjectsBtn = createCenterObjectsButton();
		locationBar.addControl(centerObjectsBtn);
		mapControls.centerObjectsBtn = centerObjectsBtn;

		// Layer control
		const layerBar = createControlBar('layerbar');
		map.addControl(layerBar);
		const layerChangeBtn = createLayerChangeButton();
		layerBar.addControl(layerChangeBtn);
		mapControls.layerChangeBtn = layerChangeBtn;

		// Add snap interaction for feature modification
		map.addInteraction(new ol.interaction.Snap({ source: vectorLayer.getSource() }));

		// Keyboard shortcuts for interaction
		document.addEventListener('keydown', handleKeyboardShortcuts);

		document.addEventListener('paste', wktUtilities.paste);

		/**
		 * Creates a control bar.
		 * @param {string} className - The class name of the control bar.
		 * @param {boolean} [toggleOne=false] - If only one control can be active at a time.
		 * @param {boolean} [group=false] - If the controls should be grouped together.
		 * @returns {ol.control.Bar} The created control bar.
		 */
		function createControlBar(className, toggleOne = false, group = false) {
			return new ol.control.Bar({ className, toggleOne, group });
		}

		/**
		 * Creates the select control with a button.
		 * @param {ol.control.Bar} selectBar - The control bar for the select tool.
		 * @returns {ol.control.Toggle} The created select control.
		 */
		function createSelectControl(selectBar) {
			const selectCtrl = new ol.control.Toggle({
				html: '<i class="fa-solid fa-arrow-pointer fa-lg"></i>',
				title: translator.get("select"),
				interaction: new ol.interaction.Select({ hitTolerance: 2, style: utilities.genericStyleFunction(colors.edit) }),
				bar: selectBar,
				autoActivate: true,
				active: true
			});

			// Handle select feature events
			selectCtrl.getInteraction().on('select', handleSelectEvents);
			return selectCtrl;
		}

		/**
		 * Handles events when features are selected or deselected.
		 * @param {ol.events.Event} evt - The event triggered by the select interaction.
		 */
		function handleSelectEvents(evt) {
			utilities.restoreDefaultColors();
			if (evt.deselected.length > 0) {
				evt.deselected.forEach(feature => {
					textarea.value = utilities.getFeatureWKT(feature);
					wktUtilities.update(feature.getId(), textarea.value);
					featureUtilities.createFromAllFeatures();
				});
				mapControls.selectBar.setVisible(false);
			}
			if (evt.selected.length > 0) {
				evt.selected.forEach(feature => {
					textarea.value = utilities.getFeatureWKT(feature);
				});
				mapControls.selectBar.setVisible(true);
			}
		}

		/**
		 * Creates a delete button for removing selected features from the map.
		 * @returns {ol.control.Button} The delete button control.
		 */
		function createDeleteButton() {
			return new ol.control.Button({
				html: '<i class="fa fa-times fa-lg"></i>',
				name: "Delete",
				title: translator.get("delete"),
				handleClick: function () {
					var features = mapControls.selectCtrl.getInteraction().getFeatures();
					if (!features.getLength()) {
						textarea.value = "Select an object first...";
					} else {
						var feature = features.item(0);

						console.log(feature, feature.getId());

						wktUtilities.remove(feature.getId());
						for (var i = 0, f; f = features.item(i); i++) {
							vectorLayer.getSource().removeFeature(f);
						}
						features.clear();
						mapUtilities.reviewLayout(false);
						mapControls.selectBar.setVisible(false);
					}
				}
			});
		}

		/**
		 * Creates an info button to show the information of the selected feature.
		 * @returns {ol.control.Button} The info button control.
		 */
		function createInfoButton() {
			return new ol.control.Button({
				html: '<i class="fa fa-info fa-lg"></i>',
				name: "Info",
				title: translator.get("showinfo"),
				handleClick: function () {
					switch (mapControls.selectCtrl.getInteraction().getFeatures().getLength()) {
						case 0:
							textarea.value = "Select an object first...";
							break;
						case 1:
							textarea.value = utilities.getFeatureWKT(mapControls.selectCtrl.getInteraction().getFeatures().item(0));
							break;
					}
				}
			});
		}

		/**
		 * Creates the modify interaction for feature editing.
		 * @param {ol.control.Toggle} selectCtrl - The select control to get selected features.
		 * @returns {ol.interaction.ModifyFeature} The created modify interaction.
		 */
		function createModifyInteraction(selectCtrl) {
			return new ol.interaction.ModifyTouch({
				features: selectCtrl.getInteraction().getFeatures(),
				//style: utilities.modifyStyleFunction,
				style: utilities.modifyStyleFunction(colors.edit),
				insertVertexCondition: () => true,
				virtualVertices: true
			});
		}

		/**
		 * Creates the draw control for adding features to the map.
		 * @returns {ol.control.Toggle} The created draw control.
		 */
		function createDrawControl() {
			const drawCtrl = new ol.control.Toggle({
				html: '<i class="fa-solid fa-draw-polygon fa-lg"></i>',
				title: translator.get("polygon"),
				interaction: new ol.interaction.Draw({
					type: 'Polygon',
					source: vectorLayer.getSource(),
					style: utilities.drawStyleFunction(colors.create),
				})
			});
			drawCtrl.getInteraction().on('drawend', handleDrawEnd);
			return drawCtrl;
		}

		/**
		 * Handles the end of the drawing interaction.
		 * @param {ol.events.Event} evt - The event triggered by the draw interaction.
		 */
		async function handleDrawEnd(evt) {
			await wktUtilities.add(evt.feature);
			mapUtilities.reviewLayout(false);
			featureUtilities.centerOnFeature(evt.feature);
			mapControls.selectCtrl.setActive(true);
			featureUtilities.deselectCurrentFeature(false);
		}

		/**
		 * Creates the undo button.
		 * @param {ol.interaction.UndoRedo} undoInteraction - The undo/redo interaction.
		 * @returns {ol.control.Button} The created undo button.
		 */
		function createUndoButton(undoInteraction) {
			return new ol.control.Button({
				html: '<i class="fa-solid fa-rotate-left fa-lg"></i>',
				title: translator.get("undo"),
				handleClick: () => undoInteraction.undo(),
			});
		}

		/**
		 * Creates the redo button.
		 * @param {ol.interaction.UndoRedo} undoInteraction - The undo/redo interaction.
		 * @returns {ol.control.Button} The created redo button.
		 */
		function createRedoButton(undoInteraction) {
			return new ol.control.Button({
				html: '<i class="fa-solid fa-rotate-right fa-lg"></i>',
				title: translator.get("redo"),
				handleClick: () => undoInteraction.redo(),
			});
		}

		/**
		 * Creates the location button to center the map on the user's location.
		 * @returns {ol.control.Button} The created location button.
		 */
		function createLocationButton() {
			return new ol.control.Button({
				html: '<i class="fa-solid fa-location-crosshairs fa-lg"></i>',
				title: translator.get("centeronmylocation"),
				handleClick: centerOnUserLocation,
			});
		}

		/**
		 * Centers the map on the user's location.
		 */
		function centerOnUserLocation() {
			if (typeof userLocation === 'undefined') {
				/**
				 * Obtém a localização geográfica do usuário e ajusta a visualização do mapa para o centro dessa localização.
				 * Após obter a localização, o mapa é atualizado com as coordenadas de latitude e longitude.
				 * 
				 * @returns {void}
				 */
				loading.show();
				utilities.getLocation()
					.then(location => {
						/**
						 * Define o centro da visualização do mapa usando as coordenadas da localização.
						 * As coordenadas são transformadas de um sistema de projeção geodético para Mercator.
						 * 
						 * @param {Object} location - O objeto contendo as coordenadas geográficas do usuário.
						 * @param {number} location.latitude - A latitude da localização do usuário.
						 * @param {number} location.longitude - A longitude da localização do usuário.
						 * @returns {void}
						 */
						map.getView().setCenter(
							ol.proj.transform([location.longitude, location.latitude], projections.geodetic, projections.mercator)
						);
						loading.hide();
					})
					/**
					 * Captura e trata erros caso a obtenção da localização falhe.
					 * 
					 * @param {Error} error - O erro gerado pela falha na obtenção da localização.
					 * @returns {void}
					 */
					.catch(error => {
						console.error(`Error obtaining location: ${error.message}`);
						loading.hide();
					});
			} else {
				map.getView().setCenter(userLocation);
			}
			map.getView().setZoom(map.getView().getZoom());
			mapControls.selectCtrl.setActive(true);
		}

		/**
		 * Creates the button to center the map on map objects.
		 * @returns {ol.control.Button} The created center objects button.
		 */
		function createCenterObjectsButton() {
			return new ol.control.Button({
				html: '<i class="fa-solid fa-arrows-to-dot fa-lg"></i>',
				title: translator.get("centerobjects"),
				handleClick: () => featureUtilities.centerOnVector(),
			});
		}

		/**
		 * Creates the layer change button.
		 * @returns {ol.control.Button} The created layer change button.
		 */
		function createLayerChangeButton() {
			return new ol.control.Button({
				html: utilities.layerChangeBtnHtml(),
				title: translator.get("changebutton"),
				handleClick: mapUtilities.toggleLayers,
			});
		}

		/**
		 * Handles keyboard shortcuts.
		 * @param {KeyboardEvent} evt - The keyboard event.
		 */
		function handleKeyboardShortcuts(evt) {
			switch (evt.key) {
				case 'Escape':
					if (!mapControls.selectCtrl.getActive()) {
						mapControls.selectCtrl.setActive(true);
					} else {
						featureUtilities.deselectCurrentFeature(true);
					}
					break;
				case 'Delete':
					if (mapControls.selectCtrl.getActive()) {
						const selectInteraction = mapControls.selectCtrl.getInteraction();
						const selectedFeatures = selectInteraction.getFeatures();
						if (selectedFeatures.getArray().length > 0) {
							mapControls.deleteBtn.getButtonElement().click();
						}
					}
					break;
				case 'z':
					if (evt.ctrlKey) undoInteraction.undo();
					break;
				case 'y':
					if (evt.ctrlKey) undoInteraction.redo();
					break;
			}
		}
	}

	return {

		init: function () {

			setupMap();

			mapUtilities.loadWKTs(true);

			/**
			 * Obtém o endereço IP do usuário e sua localização geográfica (latitude e longitude).
			 * Se o IP começar com "http", a geolocalização será consultada.
			 * Caso contrário, o IP será exibido no console.
			 * 
			 * @returns {void}
			 */
			loading.show();
			utilities.getIP()
				.then(ip => {
					// Verifica se o IP começa com "http" (indicando que é uma URL ou serviço remoto)
					if (typeof ip === 'string' && ip.startsWith('http')) {
						/**
						 * Obtém a posição geográfica do usuário.
						 * Exibe a latitude e longitude no console.
						 * 
						 * @param {GeolocationPosition} position - O objeto com a localização do usuário.
						 * @returns {void}
						 */
						navigator.geolocation.getCurrentPosition(
							position => {
								const latitude = position.coords.latitude;
								const longitude = position.coords.longitude;
								console.log(`Estimated IP based on location: ${latitude}, ${longitude}`);
							},
							/**
							 * Função de callback para erros ao tentar obter a geolocalização.
							 * 
							 * @param {GeolocationPositionError} error - O objeto de erro da geolocalização.
							 * @returns {void}
							 */
							error => {
								console.error(`Geolocation error: ${error.message}`);
							}
						);
					} else {
						console.log(`Retrieved IP address: ${ip}`);
					}
					loading.hide();
				})
				/**
				 * Captura erros durante a obtenção do IP ou da geolocalização.
				 * 
				 * @param {Error} error - O erro gerado pela tentativa de obter o IP ou a geolocalização.
				 * @returns {void}
				 */
				.catch(error => {
					console.error(`Error retrieving IP or location: ${error.message}`);
					loading.hide();
				});

		}
	};

}());

# WKT Playground

An interactive web-based tool to visualize and plot [Well-Known Text (WKT)](https://en.wikipedia.org/wiki/Well-known_text) geometric shapes on [OpenStreetMap](https://www.openstreetmap.org).

🌐 **[Live Demo](https://wkt-playground.zecompadre.complayground)**

## 📋 Features

- 🗺️ Interactive map powered by OpenLayers
- ✏️ Real-time WKT input and visualization
- 🎨 Multiple themes support
- 📦 Support for various WKT geometry types (POINT, LINESTRING, POLYGON, etc.)
- 💾 Save and load your work
- 📸 Export map as image
- 🔄 Share geometries via URL
- 📱 Responsive design

## 🚀 Usage

1. Open the [WKT Playground](https://wkt-playground.zecompadre.com)
2. Enter your WKT geometry in the text area
3. The shape will be automatically plotted on the map
4. Use the tools to customize colors, themes, and export your visualization

### Example WKT Formats

```wkt
POINT(30 10)
LINESTRING(30 10, 10 30, 40 40)
POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))
```

## 🛠️ Technologies

- [OpenLayers](https://openlayers.org/) - Map rendering
- [ol-ext](https://viglino.github.io/ol-ext/) - OpenLayers extensions
- [jQuery](https://jquery.com/) & [jQuery UI](https://jqueryui.com/) - UI components
- OpenStreetMap - Map tiles

## 📦 Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wkt-playground.git
cd wkt-playground
```

2. Serve the files with any HTTP server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

3. Open `http://localhost:8000` in your browser

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Original Code/Inspiration: [clydedacruz/openstreetmap-wkt-playground](https://github.com/clydedacruz/openstreetmap-wkt-playground)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

Made with ❤️ by [Luis Romão](https://github.com/zecompadre)

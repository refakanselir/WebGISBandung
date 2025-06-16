// Inisialisasi peta
const map = L.map('map', {
    zoomControl: false  // Nonaktifkan kontrol zoom default
}).setView([-6.903, 107.6510], 12);  // Sesuaikan zoom level untuk menampilkan seluruh Kota Bandung

// Tambahkan kontrol zoom di pojok kiri atas
L.control.zoom({
    position: 'topleft'
}).addTo(map);

// Basemap
const basemapOSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

const baseMapGoogle = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Map by <a href="https://maps.google.com/">Google</a>',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

// Tambahkan tombol fullscreen
map.addControl(new L.Control.Fullscreen({
    position: 'topleft'
}));

// Simpan koordinat "Home"
const home = {
    lat: -6.903,
    lng: 107.6510,
    zoom: 12
};

// Tambahkan tombol "Home"
L.easyButton('fa-home', function(btn, map){
    map.setView([home.lat, home.lng], home.zoom);
}, 'Kembali ke Home').addTo(map);

// Tambahkan tombol "My Location"
L.control.locate({
    position: 'topleft',
    setView: 'once',
    flyTo: true,
    keepCurrentZoomLevel: false,
    showPopup: false,
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map);

// Definisi layer group untuk menyimpan data
const jembatanPT = new L.LayerGroup();
const adminKelurahanAR = new L.LayerGroup();
const landcover = new L.LayerGroup();

// 1. Data Tutupan Lahan (Polygon) - Load first to be at the bottom layer
$.getJSON("./asset/data-spasial/landcover_ar.geojson", function(data) {
    L.geoJSON(data, {
        style: function(feature) {
            if (!feature.properties || !feature.properties.REMARK) {
                return {
                    fillColor: "#CCCCCC", 
                    fillOpacity: 0.8, 
                    weight: 0.5, 
                    color: "#000000"
                };
            }
            
            // Sesuaikan warna dengan gambar yang dilampirkan
            switch (feature.properties.REMARK) {
                case 'Danau/Situ': 
                    return {
                        fillColor: "rgb(0, 112, 150)", // Turquoise untuk badan air
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#4065EB"
                    };
                case 'Empang': 
                    return {
                        fillColor: "rgb(117, 148, 86)", // Turquoise untuk badan air
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#4065EB"
                    };
                case 'Hutan Rimba': 
                    return {
                        fillColor: "rgb(15, 98, 19)", // Spring Green untuk hutan
                        fillOpacity: 0.8, 
                        weight: 0.5,
                        color: "#006400"
                    };
                case 'Perkebunan/Kebun': 
                    return {
                        fillColor: "rgb(83, 240, 91)", // Green Yellow untuk perkebunan
                        fillOpacity: 0.8, 
                        weight: 0.5,
                        color: "#006400"
                    };
                case 'Permukiman dan Tempat Kegiatan': 
                    return {
                        fillColor: "rgb(221, 79, 18)", // Light Pink untuk permukiman sesuai gambar
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#8B0000"
                    };
                case 'Sawah': 
                    return {
                        fillColor: "rgb(93, 108, 209)", // Cyan untuk sawah sesuai gambar
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#008B8B"
                    };
                case 'Semak Belukar': 
                    return {
                        fillColor: "rgb(227, 191, 112)", // Light Green untuk semak belukar
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#006400"
                    };
                case 'Sungai': 
                    return {
                        fillColor: "rgb(3, 63, 245)", // Dodger Blue untuk sungai
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#00008B"
                    };
                case 'Tanah Kosong/Gundul': 
                    return {
                        fillColor: "rgb(138, 119, 82)", // Beige untuk tanah kosong
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#A52A2A"
                    };
                case 'Tegalan/Ladang': 
                    return {
                        fillColor: "rgb(202, 245, 132)", // Yellow untuk tegalan/ladang sesuai gambar
                        fillOpacity: 0.8, 
                        weight: 0.5,
                        color: "#8B8B00"
                    };
                case 'Vegetasi Non Budidaya Lainnya': 
                    return {
                        fillColor: "rgb(255, 169, 205)", // Lawn Green untuk vegetasi lainnya
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#006400"
                    };
                default:
                    return {
                        fillColor: "rgb(255, 35, 119)", 
                        fillOpacity: 0.8, 
                        weight: 0.5, 
                        color: "#000000"
                    };
            }
        },
        onEachFeature: function(feature, layer) {
            // Menambahkan popup dengan informasi tutupan lahan
            if (feature.properties && feature.properties.REMARK) {
                layer.bindPopup('<b>Tutupan Lahan: </b>' + feature.properties.REMARK);
            } else {
                layer.bindPopup('<b>Tutupan Lahan</b>');
            }
        }
    }).addTo(landcover);
}).fail(function(jqxhr, textStatus, error) {
    console.error("Error loading landcover data: " + error);
});

// 2. Data Batas Administrasi Kelurahan (Line)
$.getJSON("./asset/data-spasial/admin_kelurahan_ln.geojson", function(data) {
    L.geoJSON(data, {
        style: {
            color: "black",
            weight: 2,
            opacity: 1,
            // Hapus dashArray untuk menampilkan garis solid seperti pada gambar
            lineJoin: 'round'
        },
        onEachFeature: function(feature, layer) {
            // Menambahkan popup dengan informasi kelurahan
            let popupContent = '<b>Batas Kelurahan</b>';
            
            // Jika ada properti nama kelurahan, tampilkan
            if (feature.properties && feature.properties.KELURAHAN) {
                popupContent = '<b>Kelurahan: </b>' + feature.properties.KELURAHAN;
            }
            
            // Tambahkan informasi kecamatan jika tersedia
            if (feature.properties && feature.properties.KECAMATAN) {
                popupContent += '<br><b>Kecamatan: </b>' + feature.properties.KECAMATAN;
            }
            
            layer.bindPopup(popupContent);
        }
    }).addTo(adminKelurahanAR);
}).fail(function(jqxhr, textStatus, error) {
    console.error("Error loading kelurahan data: " + error);
});

// 3. Data Jembatan (Point)
const symbologyPoint = {
    radius: 5,
    fillColor: "#000000", // Hitam untuk jembatan sesuai gambar
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 1
};

$.getJSON("./asset/data-spasial/jembatan_pt.geojson", function(data) {
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, symbologyPoint);
        },
        onEachFeature: function(feature, layer) {
            // Menambahkan popup dengan informasi jembatan
            let popupContent = '<b>Jembatan</b>';
            
            // Jika ada properti nama, tampilkan
            if (feature.properties && feature.properties.NAMA) {
                popupContent = '<b>Jembatan: </b>' + feature.properties.NAMA;
            }
            
            // Tambahkan informasi lain jika tersedia
            if (feature.properties && feature.properties.JENIS) {
                popupContent += '<br><b>Jenis: </b>' + feature.properties.JENIS;
            }
            
            layer.bindPopup(popupContent);
        }
    }).addTo(jembatanPT);
}).fail(function(jqxhr, textStatus, error) {
    console.error("Error loading jembatan data: " + error);
});

// Tambahkan semua layer ke peta dalam urutan yang benar
landcover.addTo(map);      // Layer paling bawah
adminKelurahanAR.addTo(map); // Layer tengah
jembatanPT.addTo(map);     // Layer paling atas

// Tambahkan layer control untuk mengaktifkan/menonaktifkan layer
const baseMaps = {
    "OpenStreetMap": basemapOSM,
    "OSM Humanitarian": osmHOT,
    "Google Maps": baseMapGoogle
};

const overlayMaps = {
    "Tutupan Lahan": landcover,
    "Batas Desa/Kelurahan": adminKelurahanAR,
    "Jembatan": jembatanPT
};

L.control.layers(baseMaps, overlayMaps, {
    position: 'topright',
    collapsed: false
}).addTo(map);

// Tambahkan legenda untuk tutupan lahan
let legend = L.control({ position: "topright" }); 
    legend.onAdd = function () { 
        let div = L.DomUtil.create("div", "legend"); 
        div.innerHTML = 
            // Judul Legenda 
            '<p style= "font-size: 18px; font-weight: bold; margin-bottom: 5px; margin-top: 10px">Legenda</p>' + 
            '<p style= "font-size: 12px; font-weight: bold; margin-bottom: 5px; margin-top: 10px">Infrastruktur</p>' + 
            '<div><svg style="display:block;margin:auto;text-align:center;stroke-width:1;stroke:rgb(0,0,0);"><circle cx="15" cy="8" r="5" fill="#9dfc03" /></svg></div>Jembatan<br>' + 
            // Legenda Layer Batas Administrasi 
            '<p style= "font-size: 12px; font-weight: bold; margin-bottom: 5px; margin-top: 10px">Batas Administrasi</p>'+ 
            '<div><svg><line x1="0" y1="11" x2="23" y2="11" style="stroke-width:2;stroke:rgb(0,0,0);stroke-dasharray:10 1 1 1 1 1 1 1 1 1"/></svg></div>Batas Desa/Kelurahan<br>'+ 
            // Legenda Layer Tutupan Lahan 
            '<p style= "font-size: 12px; font-weight: bold; margin-bottom: 5px; margin-top: 10px">Tutupan Lahan</p>' + 
            '<div style="background-color:rgb(0, 112, 150)"></div>Danau/Situ<br>' + 
            '<div style="background-color:rgb(117, 148, 86)"></div>Empang<br>' + 
            '<div style="background-color:rgb(15, 98, 19)"></div>Hutan Rimba<br>' + 
            '<div style="background-color:rgb(83, 240, 91)"></div>Perkebunan/Kebun<br>' + 
            '<div style="background-color:rgb(191, 159, 241)"></div>Permukiman dan Tempat Kegiatan<br>'+ 
            '<div style="background-color:rgb(159, 241, 231)"></div>Sawah<br>' + 
            '<div style="background-color:rgb(227, 191, 112)"></div>Semak Belukar<br>' + 
            '<div style="background-color:rgb(3, 63, 245)"></div>Sungai<br>' + 
            '<div style="background-color:rgb(138, 119, 82)"></div>Tanah Kosong/Gundul<br>' + 
            '<div style="background-color:rgb(202, 245, 132)"></div>Tegalan/Ladang<br>' + 
            '<div style="background-color:rgb(255, 169, 205)", // Lawn Green untuk vegetasi lainnya"></div>Vegetasi Non Budidaya Lainnya<br>'; 
            return div; 
        }; 
        legend.addTo(map); 

// Tambahkan skala peta
L.control.scale({
    position: 'bottomleft',
    imperial: false // Hanya tampilkan skala metrik
}).addTo(map);

// Tambahkan atribusi peta di pojok kanan bawah
map.attributionControl.setPrefix('');
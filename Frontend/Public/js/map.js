mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10 // starting zoom
});
console.log(listing.geometry.coordinates);
const marker1 = new mapboxgl.Marker({color: "red"})
        .setLngLat(listing.geometry.coordinates).setPopup(
            new mapboxgl.Popup({offset: 25}).setHTML(
                `<h3>${listing.title}</h3><p>Exact Location will be provided after booking</p>`
            )
        )
        .addTo(map);

        
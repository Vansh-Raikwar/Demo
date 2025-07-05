const mapboxgl = require('mapbox-gl');

// Public/js/map.test.js

jest.mock('mapbox-gl', () => ({
    Map: jest.fn(),
    Marker: jest.fn().mockImplementation(() => ({
        setLngLat: jest.fn().mockReturnThis(),
        addTo: jest.fn().mockReturnThis(),
        setBounce: jest.fn()
    }))
}));

describe('Map Initialization', () => {
    beforeEach(() => {
        mapboxgl.Map.mockClear();
        mapboxgl.Marker.mockClear();
    });

    test('should initialize the map with correct parameters', () => {
        require('./map'); // Assuming map.js is in the same directory

        expect(mapboxgl.Map).toHaveBeenCalledWith({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [mapCo[0], mapCo[1]],
            zoom: 10
        });
    });

    test('should add a marker to the map with correct properties', () => {
        require('./map');

        expect(mapboxgl.Marker).toHaveBeenCalledWith({ color: "red" });
        const markerInstance = mapboxgl.Marker.mock.instances[0];
        expect(markerInstance.setLngLat).toHaveBeenCalledWith(mapCo);
        expect(markerInstance.addTo).toHaveBeenCalledWith(expect.any(Object));
    });

    test('should set bounce effect on the marker', () => {
        require('./map');

        const markerInstance = mapboxgl.Marker.mock.instances[0];
        expect(markerInstance.setBounce).toHaveBeenCalledWith(5);
    });
});
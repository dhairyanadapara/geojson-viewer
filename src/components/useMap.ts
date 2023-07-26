import {
    useCallback,
    useEffect, useRef, useState,
} from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import {
    Fill, Stroke, Style,
} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import BingMaps from 'ol/source/BingMaps';
import { transform } from 'ol/proj';
import { debounce } from 'lodash';
import { Select } from 'ol/interaction';
import { click, pointerMove } from 'ol/events/condition';

const maskGeojson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {},
            geometry: {
                coordinates: [
                    [
                        [
                            -161.68727540433147,
                            84.47093693414348,
                        ],
                        [
                            -161.68727540433147,
                            -84.61577991541287,
                        ],
                        [
                            199.94396293614284,
                            -84.61577991541287,
                        ],
                        [
                            199.94396293614284,
                            84.47093693414348,
                        ],
                        [
                            -161.68727540433147,
                            84.47093693414348,
                        ],
                    ],
                ],
                type: 'Polygon',
            },
        },
    ],
};

const useMap = () => {
    const mapRef = useRef(null);
    const [borderPoints, setBorderPoints] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState(null);

    const selected = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.3)',
        }),
        stroke: new Stroke({
            color: 'rgba(255, 255, 255, 1)',
            width: 2,
        }),
    });

    const hoverStyle = (feature) => {
        const color = feature.get('COLOR') || 'rgba(0, 0, 255, 0.3)';
        selected.getFill().setColor(color);
        return selected;
    };

    const selectStyle = (feature) => {
        const color = feature.get('COLOR') || 'rgba(0, 255, 255, 0.3)';
        selected.getFill().setColor(color);
        return selected;
    };

    // Create Map
    useEffect(() => {
        const map = new Map({
            // id of div where map will be loaded
            target: 'map',
            layers: [
                // new TileLayer({
                //   source: new OSM(),
                // }),
                // new TileLayer({
                //   visible: true,
                //   preload: Infinity,
                //   source: new BingMaps({
                //     key: process.env.REACT_APP_BING_MAPS_API_KEY,
                //     imagerySet: 'Aerial',
                //   }),
                // }),
                new TileLayer({
                    visible: true,
                    preload: Infinity,
                    source: new BingMaps({
                        key: import.meta.env.VITE_BING_MAPS_API_KEY,
                        imagerySet: 'canvasLight',

                    }),
                }),
            ],
            view: new View({
                center: transform([-95, 40], 'EPSG:4326', 'EPSG:3857'),
                zoom: 4,
                maxZoom: 19,
            }),
        });
        mapRef.current = map;

        return () => {
            map.setTarget(null);
        };
    }, []);

    // Add new geoJSON layer
    const addLayer = useCallback((geoJson, level) => new Promise((resolve) => {
        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(geoJson, {
                dataProjection: 'EPSG:4326', // GeoJSON projection
                featureProjection: 'EPSG:3857', // Map projection (Web Mercator)
            }),
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                fill: new Fill({
                    color: level === 1 ? '#2069E866' : '#FBE8E8', // Red color with 50% transparency
                }),
                stroke: new Stroke({
                    color: 'rgba(255, 255, 255, 1)',
                    width: 2,
                }),
            }),
            zIndex: 1,
            name: 'Hello',
        });

        mapRef.current.addLayer(vectorLayer);

        const selectPointerMove = new Select({
            condition: pointerMove,
            style: hoverStyle,
        });

        const selectClick = new Select({
            condition: click,
            style: selectStyle,
        });

        mapRef.current.addInteraction(selectPointerMove);
        mapRef.current.addInteraction(selectClick);

        // Register event listeners
        selectClick.on('select', (event) => {
            const selectedFeatures = event.target.getFeatures().getArray();
            if (selectedFeatures.length > 0) {
                setSelectedLayer(selectedFeatures[0].get('id'));
            }
            else {
                setSelectedLayer(null);
            }
        });

        vectorLayer.on('pointermove', (event) => {
            if (event.dragging) {
                return;
            }

            mapRef.current.getTargetElement().style.cursor = 'pointer';

            const hit = mapRef.current.hasFeatureAtPixel(event.pixel, {
                layerFilter: (layer) => layer === vectorLayer,
            });

            if (hit) {
                mapRef.current.getTargetElement().style.cursor = 'pointer';
            }
        });

        vectorLayer.set('selectInteraction', selectPointerMove);

        resolve(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    // Add masking layer
    const addMaskLayer = () => {
        if (mapRef.current) {
            const maskSource = new VectorSource({
                features: new GeoJSON().readFeatures(maskGeojson),
            });

            const maskLayer = new VectorLayer({
                source: maskSource,
                style: new Style({
                    fill: new Fill({
                        color: 'rgba(0, 0, 0, 1)', // You can customize the mask color and transparency here
                    }),
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 1)',
                    }),
                }),
            });

            mapRef.current.addLayer(maskLayer);

            const extent = maskSource.getExtent();
            mapRef.current.getView().fit(extent);
        }
    };

    const handleZoomIn = () => {
        const view = mapRef.current.getView();
        const currentZoom = view.getZoom();
        const newZoom = currentZoom + 1;
        view.animate({
            zoom: newZoom,
            duration: 500,
        });
    };

    const handleZoomOut = () => {
        const view = mapRef.current.getView();
        const currentZoom = view.getZoom();
        const newZoom = currentZoom - 1;

        view.animate({
            zoom: newZoom,
            duration: 500,
        });
    };

    useEffect(() => {
        const calculateExtent = () => {
            const extent = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
            const topLeft = transform([extent[0], extent[3]], 'EPSG:3857', 'EPSG:4326').reverse();
            const topRight = transform([extent[2], extent[3]], 'EPSG:3857', 'EPSG:4326').reverse();
            const bottomRight = transform([extent[2], extent[1]], 'EPSG:3857', 'EPSG:4326').reverse();
            const bottomLeft = transform([extent[0], extent[1]], 'EPSG:3857', 'EPSG:4326').reverse();
            setBorderPoints([topLeft, topRight, bottomRight, bottomLeft]);
            // console.log(topLeft, topRight, bottomRight, bottomLeft);
        };

        const debouncedCalculateExtent = debounce(calculateExtent, 1000);

        mapRef.current.on('moveend', debouncedCalculateExtent);

        return () => {
            mapRef.current.un('moveend', debouncedCalculateExtent);
        };
    }, [mapRef]);

    return {
        map: mapRef.current, addLayer, handleZoomIn, handleZoomOut, selectedLayer, borderPoints, addMaskLayer,
    };
};

export default useMap;
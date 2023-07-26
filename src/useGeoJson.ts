// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState, useEffect } from 'react';
import supercluster from 'supercluster';


const useGeoJson = () => {
    const [uploadedGeoJSON, setUploadedGeoJSON] = useState(null);
    const [clusteredGeoJSON, setClusteredGeoJSON] = useState(null);
    const [simplifiedGeoJSON, setSimplifiedGeoJSON] = useState(null);

    useEffect(() => {
        // Clean up the clustered and simplified GeoJSON data on unmount
        return () => {
            setClusteredGeoJSON(null);
            setSimplifiedGeoJSON(null);
        };
    }, []);

    // Function to read and parse GeoJSON file
    const readGeoJSONFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const geojsonData = JSON.parse(e.target.result);
                    resolve(geojsonData);
                } catch (error) {
                    reject('Error parsing GeoJSON file');
                }
            };

            reader.onerror = () => {
                reject('Error reading GeoJSON file');
            };

            reader.readAsText(file);
        });
    };

    // Function to simplify GeoJSON data using a specified tolerance
    const simplifyGeoJSON = (geojsonData: GeoJSONData, tolerance) => {
        // Implement the logic for simplification here, using a library like Mapshaper or simplify-geojson
        // For example, you can use turf-simplify: https://turfjs.org/docs/#simplify

        return simplifiedGeojsonData;
    };

    // Function to cluster GeoJSON point data
    const clusterGeoJSON = (geojsonData, radius, maxZoom) => {
        const cluster = supercluster({
            radius,
            maxZoom,
        });

        cluster.load(
            geojsonData.features.map((feature, index) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: feature.geometry.coordinates,
                },
                properties: {
                    index,
                    ...feature.properties,
                },
            }))
        );

        return cluster;
    };

    return {
        uploadedGeoJSON,
        setUploadedGeoJSON,
        clusteredGeoJSON,
        setClusteredGeoJSON,
        simplifiedGeoJSON,
        setSimplifiedGeoJSON,
        readGeoJSONFile,
        simplifyGeoJSON,
        clusterGeoJSON,
    };
};

export default useGeoJson;

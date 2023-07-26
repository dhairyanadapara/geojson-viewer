// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';

import useMap from './useMap';
import { MinusIcon, AddIcon, EditIcon } from '@chakra-ui/icons'
import { GeoJSONData } from '../types';




const MapComponent = () => {
    const {
        addLayer, handleZoomIn, handleZoomOut,
    } = useMap();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addLayers = () => {
        // addLayer(geoJson, 1);
        // addLayer(geoJson2, 1);
        // addLayer(geoJson3, 1);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const geojsonData = JSON.parse(e.target?.result as string) as GeoJSONData;
                    addLayer(geojsonData, 1);
                }
                catch (error) {
                    console.error('Error parsing GeoJSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleCustomButtonClick = () => {
        fileInputRef.current?.click();
    };

    useEffect(() => {
        addLayers();
    }, []);

    return (
        <div className="map-container">
            <div className="control-actions">
                {/* <div className="button-group">
                    <IconButton variant="ghost"><SearchIcon /></IconButton>
                </div>
                <div className="button-group">
                    <IconButton variant="ghost"><MousePointer /></IconButton>
                    <IconButton variant="ghost"><MapPin /></IconButton>
                </div> */}
                <div className="button-group">
                    <AddIcon className='c-btn' onClick={handleZoomIn} />
                    <MinusIcon className='c-btn' onClick={handleZoomOut} />
                </div>
                <div className="button-group"><EditIcon className='c-btn' onClick={handleCustomButtonClick} />
                    <input
                        accept=".geojson"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        type="file"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
            <div
                id="map"
                style={{
                    width: '100%',
                    height: '100vh',
                }}
            />
        </div>
    );
};

export default MapComponent;

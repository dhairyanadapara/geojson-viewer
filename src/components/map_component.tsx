// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';

import useMap from './useMap';
import { MinusIcon, AddIcon, EditIcon, SearchIcon } from '@chakra-ui/icons'
import { GeoJSONData } from '../types';
import { IconButton } from '@chakra-ui/react';
import useGeoJson from '../useGeoJson';

const MapComponent = () => {
    const {
        addLayer, handleZoomIn, handleZoomOut,
    } = useMap();
    const {
        clusterGeoJSON,
    } = useGeoJson();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const geojsonData = JSON.parse(e.target?.result as string) as GeoJSONData;
                    if (file?.size > 2 * 1048 * 1048) {
                        const data = clusterGeoJSON(geojsonData)
                        console.log(data)
                    }
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

    return (
        <div className="map-container">
            <div className="control-actions">
                <div className="button-group">
                    <IconButton variant="ghost"><SearchIcon /></IconButton>
                </div>
                {/* <div className="button-group">
                    <IconButton variant="ghost"><MousePointer /></IconButton>
                    <IconButton variant="ghost"><MapPin /></IconButton>
                </div> */}
                <div className="button-group">
                    <IconButton variant="ghost"><AddIcon className='c-btn' onClick={handleZoomIn} /></IconButton>
                    <IconButton variant="ghost"><MinusIcon className='c-btn' onClick={handleZoomOut} /></IconButton>
                </div>
                <div className="button-group">
                    <IconButton variant="ghost"><EditIcon className='c-btn' onClick={handleCustomButtonClick} /></IconButton>
                    <input
                        accept=".geojson, .json"
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

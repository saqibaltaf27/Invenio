import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Input, Label } from 'reactstrap';
import './Settings.scss';

function Settings() {
    const [dateFormat, setDateFormat] = useState('YYYY-MM-DD'); // Example setting
    const [currency, setCurrency] = useState('USD');
    const [inventoryAlertThreshold, setInventoryAlertThreshold] = useState(5);

    // Function to handle changes in settings
    const handleSettingChange = (settingName, newValue) => {
        console.log(`Setting ${settingName} changed to ${newValue}`);
        // In a real application, you would update the setting's value here.
        switch (settingName) {
            case 'dateFormat':
                setDateFormat(newValue);
                break;
            case 'currency':
                setCurrency(newValue);
                break;
            case 'inventoryAlertThreshold':
                setInventoryAlertThreshold(parseInt(newValue, 10));
                break;
            default:
                break;
        }
    };

    return (
        <div className='settings'>
            <h3>Settings</h3>
            <Card className="mt-4">
                <Card.Body>
                    <CardTitle tag="h4">General Settings</CardTitle>
                    <div className="mt-3">
                        <Label htmlFor="dateFormat" className="mr-2">Date Format:</Label>
                        <Input
                            type="text"
                            id="dateFormat"
                            value={dateFormat}
                            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            style={{ maxWidth: '150px', display: 'inline-block' }}
                        />
                         <p className="text-muted">
                            Example: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
                        </p>
                    </div>

                    <div className="mt-3">
                        <Label htmlFor="currency" className="mr-2">Currency:</Label>
                        <Input
                            type="text"
                            id="currency"
                            value={currency}
                            onChange={(e) => handleSettingChange('currency', e.target.value)}
                            style={{ maxWidth: '100px', display: 'inline-block' }}
                        />
                        <p className="text-muted">
                            Example: USD, EUR, GBP, PKR
                        </p>
                    </div>
                    <div className="mt-3">
                        <Label htmlFor="inventoryAlertThreshold" className="mr-2">
                            Inventory Alert Threshold:
                        </Label>
                        <Input
                            type="number"
                            id="inventoryAlertThreshold"
                            value={inventoryAlertThreshold}
                            onChange={(e) =>
                                handleSettingChange('inventoryAlertThreshold', e.target.value)
                            }
                            style={{ maxWidth: '100px', display: 'inline-block' }}
                        />
                        <p className="text-muted">
                            Minimum stock level to trigger an alert.
                        </p>
                    </div>
                </Card.Body>
            </Card>
            {/* Add more settings sections as needed (e.g., User Settings,
            Appearance Settings) */}
        </div>
    );
}

export default Settings;

// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require("tencentcloud-sdk-nodejs");
const IotexplorerClient = tencentcloud.iotexplorer.v20190423.Client;
const clientConfig = {
    credential: {
        secretId: "AKID84lCNHTJQIuFK8gwxibGfpiMkskL5la8",
        secretKey: "RcZHkz0mJbeS0KRJwJRKyMUMyJODm58u",
    },
    region: "ap-guangzhou",
    profile: {
        httpProfile: {
            endpoint: "iotexplorer.tencentcloudapi.com",
        },
    },
};
const client = new IotexplorerClient(clientConfig);

async function otaUpdateFirmware(params) {
    const { ProductID, DeviceName, FirmwareVersion, FirmwareOriVersion, UpgradeMethod = 0 } = params;

    return await client.UpdateFirmware({
        ProductID,
        DeviceName,
        FirmwareVersion,
        FirmwareOriVersion,
        UpgradeMethod
    });
}

async function otaGetFirmwares(params)
{
    const { PageNum = 1, PageSize = 10 } = params;

    return await client.ListFirmwares({
        PageNum,
        PageSize
    });
}

exports.main = async (event, context) => {
    const { action } = event;
    
    switch (action) {
        case 'UpdateFirmware':
            return await otaUpdateFirmware(event);
        case "ListFirmwares":
            return await otaGetFirmwares(event);
    }

    return event;
}


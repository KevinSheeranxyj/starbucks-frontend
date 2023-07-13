import http from "@/utils/http";
import tool from "@/utils/tool";


/**
 * 获取组织列表
 */
async function getOrganizationOptions(options) {
    const {data: res} = await http.post('/organization/list', {});
    options.length = 0;
    res.data.forEach((organization) => {
        const data = {
            label: organization.name,
            value: organization.organizationId,
        };
        options.push(data);
    });
}

/**
 * 查询网络
 */
async function getNetworkOptions(organizationId, options) {
    let networkNameDict = {};
    if (organizationId){
        const { data: res } = await http.post('/sys/redis/value', {key: 'DICT:NETWORK_NAME:ORG_ID:'+ organizationId});
        networkNameDict = JSON.parse(res.data.value);
    } else {
        const { data: office } = await http.post('/sys/redis/value', {key: 'DICT:OFFICE_ORG_ID'});
        const officeOrgId = office.data.value;
        const { data: officeRes } = await http.post('/sys/redis/value', {key: 'DICT:NETWORK_NAME:ORG_ID:'+ officeOrgId});
        const officeNetworkNameDict = JSON.parse(officeRes.data.value);

        const { data: store } = await http.post('/sys/redis/value', {key: 'DICT:STORE_ORG_ID'});
        const storeOrgId = store.data.value;
        const { data: storeRes } = await http.post('/sys/redis/value', {key: 'DICT:NETWORK_NAME:ORG_ID:'+ storeOrgId});
        const storeNetworkNameDict = JSON.parse(storeRes.data.value);
        // JSON对象合并
        networkNameDict = Object.assign({}, officeNetworkNameDict, storeNetworkNameDict);
    }

    if(networkNameDict){
        options.length = 0;
        for(let networkId in networkNameDict) {
            const data = {
                label: networkNameDict[networkId],
                value: networkId,
            };
            options.push(data);
        }
    }
}

/**
 * 获取设备列表
 */
async function getDeviceOptions(req, deviceNameOptions, deviceSerialOptions, macOptions, publicIpOptions) {
    const body = {
        'organizationId': req.organizationId,
        'networkId': req.networkId,
        'productType': req.productType,
    }
    const {data: res} = await http.post('/device/option/list', body);
    deviceNameOptions.length = 0;
    deviceSerialOptions.length = 0;
    macOptions.length = 0;
    publicIpOptions.length = 0;

    const publicIpList = [];
    res.data.forEach((device) => {
        if (device.name) {
            deviceNameOptions.push({
                label: device.name,
                value: device.name,
            });
        }

        deviceSerialOptions.push({
            label: device.serial,
            value: device.serial,
        });

        macOptions.push({
            label: device.mac,
            value: device.mac,
        });

        if (device.publicIp) {
            publicIpList.push({
                label: device.publicIp,
                value: device.publicIp,
            });
        }
    });

    // 公网IP去重
    tool.removalOptions(publicIpList).forEach((publicIp) => {
        publicIpOptions.push({
            label: publicIp.label,
            value: publicIp.label,
        })
    });
}


/**
 * 根据设备状态获取标签类型
 */
function getTagTypeByStatus(value) {
    if (value === 'online') {
        return 'success';
    } else if (value === 'alerting') {
        return 'danger';
    } else if (value === 'offline') {
        return 'info';
    } else if (value === 'dormant') {
        return 'warning';
    }
}

function getTagTypeByWanStatus (value)  {
    if (value === 'active') {
        return 'success';
    } else if (value === 'failed') {
        return 'danger';
    } else if (value === 'not connected') {
        return 'info';
    }
}

function getTimespanOptions(timespanOptions) {
    for (let i = 1, len = 32; i < len; i++) {
        timespanOptions.push({
            label: i + '天',
            value: i * 86400,
        },)
    }
}

export {getOrganizationOptions, getNetworkOptions, getDeviceOptions, getTagTypeByStatus, getTagTypeByWanStatus, getTimespanOptions};



/**
 * 版本控制模型
 */
import {Http} from "../utils/http";
import {InterAction} from "./interaction";

class VersionController {
    /**
     * 获取最新的软件版本
     * @returns {Promise<*>}
     */
    static async getAppVersion() {
        const res = await Http.request({
            url: `5db15a4b3e571`,
            data: {
                type: 3// 钉钉对应3
            }
        });
        if (res.code === 1) {
            return res.data;
        } else {
            InterAction.fnAlert('抱歉', '小程序版本校验失败，请退出钉钉后重新打开本小程序', '好的');
        }
        /*
        {
	"code": 1,
	"msg": "操作成功",
	"data": {
		"id": 27,
		"create_time": 1573806643,
		"status": 1,
		"app_name": "0",
		"version": "0.0.45",
		"app_url": "",
		"desc": "钉钉",
		"size": 0,
		"type": 3,
		"code": 45
	}
}
        * */
    }

    /**
     * 更新软件版本
     * @returns {Promise<*>}
     */
    async setAppVersion() {
        return await Http.request({
            url: `5dcb5ad16ffcb`,
        });
    }

    /**
     * 判断是否是最新版本
     */
    static async isAppNewVersion(currentVersion) {
        const onlineNewVersion = await this.getAppVersion();// 后台设置的版本
        console.log(onlineNewVersion);
        console.log(onlineNewVersion.version);
        // 判断当前版本是否是新版本
        if (onlineNewVersion.version === currentVersion) {
            return;
        } else {
            // InterAction.fnAlert('抱歉', `有新版本${onlineNewVersion.version}，请退出钉钉应用后重新打开刷新`, '好的');
        }
    }
}

export {
    VersionController
}
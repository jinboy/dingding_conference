import {Storage} from "../../utils/storage";
import {Conference} from "../../model/conference/conference";
import {Navigate} from "../../utils/native-api/interface/navigate";
import {PageUrlConstant} from "../../config/pageUrlConstant";
import {Caching} from "../../utils/native-api/caching/caching";
import {InterAction} from "../../utils/native-api/interface/interaction";
import {CheckLogin} from "../../core/authentication/CheckLogin";

const app = getApp();
Page({
    data: {
        isLeaderInDepts: false,// 默认不是部门主管

        hasMeeting: false,

        nowConferenceList: null,// 当前会议
        futureConferenceList: null,// 预备会议
        pastConferenceList: null,// 历史会议

        isShowNowConferenceList: false,// 默认不显示当前会议列表
        isShowFutureConferenceList: false,// 默认不显示预备会议列表
        isShowPastConferenceList: false,// 默认不显示历史会议列表
    },

    async onLoad() {
        // await this.initData();

        // const res = await ApiAccessToken.initAccessToken();
    },

    async onShow() {
        await this.initData();
        //
        // const res = await ApiAccessToken.initAccessToken();
    },

    /**
     * 下拉刷新
     */
    async onPullDownRefresh() {
        // this.removeCache();
        await this.initData();// 重新初始化会议列表
        dd.stopPullDownRefresh();
    },

    removeCache() {
        try {
            Caching.removeStorageSync('AccessToken');
            Caching.removeStorageSync('AccessTokenTime');
            Caching.removeStorageSync('currentUser');
            Caching.removeStorageSync('department');
            Caching.removeStorageSync('dev_id');
            Caching.removeStorageSync('isLeaderInDepts');
            Caching.removeStorageSync('orgId');
            Caching.removeStorageSync('orgName');
            Caching.removeStorageSync('user');
        } catch (err) {
            console.log('err', err);
        }
    },

    /**
     * 初始化页面骨架数据
     */
    async initData() {
        await CheckLogin.fnRecheck();
        const currentUser = Caching.getStorageSync('currentUser');
        if (currentUser) {
            const orgName = currentUser.basicCurrentUserInfo.orgName == undefined ? '支部' : currentUser.basicCurrentUserInfo.orgName;
            Navigate.setNavigationBar(`${orgName}`, '#D40029');
            this.setData({
                isLeaderInDepts: Caching.getStorageSync('isLeaderInDepts')
            });
            // 获取会议列表
            this.initConferenceData();
        } else {
            InterAction.fnShowToast('初始化页面失败', 'none', 2000);
        }
    },


    /** 初始化会议数据 */
    async initConferenceData() {
        let that = this;
        const currentUserid = Storage.getStorageSyncByKey('user');

        // const conferenceList = await Conference.getConferenceList();// 获取会议列表
        const conferenceListByUserId = await Conference.getConferenceList(currentUserid);// 获取当前用户会议列表，因为涉及到用户签到情况

        const nowConferenceList = conferenceListByUserId.now;// 当前会议
        const futureConferenceList = conferenceListByUserId.future;// 预备会议
        const pastConferenceList = conferenceListByUserId.past;// 当前用户历史会议
        const ishasMeeting = nowConferenceList.length == 0 && futureConferenceList.length == 0 && pastConferenceList.length == 0;
        this.setData({
            hasMeeting: ishasMeeting,
            nowConferenceList: nowConferenceList,// 当前会议
            futureConferenceList: futureConferenceList,// 预备会议
            pastConferenceList: pastConferenceList,// 当前用户历史会议
            isShowNowConferenceList: nowConferenceList.length == 0 ? false : true,
            isShowFutureConferenceList: futureConferenceList.length == 0 ? false : true,
            isShowPastConferenceList: pastConferenceList.length == 0 ? false : true,
        });
    },

    /**
     * 管理员新增会议
     */
    addConference() {
        Navigate.navigateTo(PageUrlConstant.addConference);
    },
})

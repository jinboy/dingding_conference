import {Navigate} from "../../../utils/native-api/interface/navigate";
import {PageUrlConstant} from "../../../config/pageUrlConstant";
import {Positioning} from "../models/positioning";
import {OperationGroup} from "../models/operation/operation-group";
import {OperationGroupJudger} from "../models/operation/operationGroupJudger";

Component({
    mixins: [],
    data: {
        conference: Object,
        operationGroup: Object,
        imgObjArr: Array,
    },

    props: {
        data: Object,
        isLeaderInDepts: false,// 是否是主管
    },

    didMount() {
        let operationGroup = new OperationGroup();
        this.setData({
            operationGroup: operationGroup
        });
    },

    didUpdate(prevProps, prevData) {
        this.data.conference = this.props.data;// 拿到父级传来的conference
        if (this.data.operationGroupLocated) {
            // 已经定位签到
            this.setData({
                operationGroup: this.data.operationGroupLocated
            });
        } else {
            // 没有定位签到默认为加载到详情页时，直接根据用户数据判断是否签到
            let operationJudger = new OperationGroupJudger(this.data.conference.sign_type);// 页面渲染时初始化按钮状态
            this.setData({
                operationGroup: operationJudger.operationGroup
            });
        }
        console.log('this.data.operationGroup', this.data.operationGroup);

    },

    didUnmount() {
        //    嘻嘻嘻嘻
        console.log('123');
    },

    methods: {
        /**
         * 签到当前会议
         * @returns {Promise<void>}
         */
        async locationCheckCurrentConference() {
            let positioning = new Positioning(this.data.conference);
            await positioning.checkIn();
            this.setData({
                operationGroupLocated: positioning.operationGroup.operationGroup
            });
        },

        /**
         * 请假
         */
        takeOff() {
            const conference = this.data.conference;
            console.log('conference',JSON.stringify(conference));
            Navigate.navigateTo(`${PageUrlConstant.takeOff}?conference=` + JSON.stringify(conference));
        },

        /**
         *
         */
        toPhoto() {
            let imgArr = this.data.conference.imgs;
            let mid = this.data.conference.id;
            Navigate.navigateTo(`${PageUrlConstant.photo}?imgArr=` + JSON.stringify(imgArr) + '&mid=' + mid);
        },

        /**
         * 纪要
         */
        summary() {
            const mid = this.data.conference.id;
            Navigate.navigateTo(`${PageUrlConstant.conferenceSummary}?mid=` + mid);
        },

        /**
         * 笔记
         */
        note() {
            const conference = this.data.conference;
            Navigate.navigateTo(`${PageUrlConstant.conferenceNote}?conference=` + +JSON.stringify(conference));
        },

        /**
         * 发送钉
         */
        notice() {
            // console.log(this.data.conference)
            // let userIdArr = Conference.extractUserId(this.data.conference.conferee);// 全部参会人员id
            // console.log(userIdArr);
            let useridArr = [];
            this.data.readInfo[1].forEach(user => {
                useridArr.push(user.userid);
            });
            // console.log('useridArr');
            // console.log(useridArr);
            // console.log('useridArr');
            Ding.createNoticeDing({
                users: useridArr,
                corpId: app.globalData.corpId,
                text: this.data.conference.theme,
            })
        },
    },
});
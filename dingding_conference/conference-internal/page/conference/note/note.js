import {InterAction} from "../../../utils/native-api/interface/interaction";
import {Notes} from "../../../model/conference/notes";
import {Caching} from "../../../utils/native-api/caching/caching";
import {NoteInfo} from "../../../model/conference/NoteInfo";
import {CheckLogin} from "../../../core/authentication/CheckLogin";
import {Upload} from "../../../model/conference/upload";

const app = getApp();
Page({
    data: {
        conference: null,
        currentUserId: null,

        noteText: '',
        pngUrl: '',
        isShowWritePng: true,

        filePaths: null,
        imgArrEx: [],
        imgArrExLength: 0,
        imgArr: [],
        chooseViewShow: true,
        uploadFlag: true,// 默认上传成功

        totalImgArr: [],
        totalImgIdArr: [],
    },

    async onLoad(params) {
        if (params.conference) {
            let currentConference = JSON.parse(params.conference);
            console.log('note:', currentConference);
            this.setData({
                mid: currentConference.id
            });
            Caching.setStorageSync('mid', currentConference.id);
        }
        this.setData({
            params: params
        })
    },

    async onShow() {
        InterAction.fnShowLoading('加载中');
        await this._init();
        InterAction.fnHideLoading();
    },

    async _init() {
        await this._initUser();
        this._initData();
        this.initWriteImage(this.data.params);
    },

    async _initUser() {
        await CheckLogin.fnRecheck();
    },

    async _initData() {
        Caching.setStorageSync('mid', Caching.getStorageSync('mid'));
        await this._initCurrentConferenceUserNote();
    },

    initWriteImage(param) {
        let pngString = null;
        if (param.pngDataUrl) {
            // pngString = JSON.parse(param.pngDataUrl);
            pngString = dd.getStorageSync({key: 'pngString'}).data;
            console.log(`pngData pngString`, pngString);
            this.setData({
                pngUrl: pngString.pngString ? pngString.pngString : ''
            });
        }
    },


    // async formSubmit(e) {
    //     let that = this;
    //     const mid = this.data.mid ? this.data.mid : Caching.getStorageSync('mid');
    //     console.log('uid', Caching.getStorageSync('currentUser'));
    //     const uid = Caching.getStorageSync('currentUser').basicCurrentUserInfo.userid;
    //     const text = e.detail.value.text;
    //     let imgsStr = ' ';
    //     if (this.data.totalImgIdArr.length > 0) {// 有图片才能上传
    //         imgsStr = this.data.totalImgIdArr.join(',');
    //     }
    //     const orgId = Caching.getStorageSync('orgId');
    //
    //     const noteInfo = new NoteInfo(mid, uid, text, imgsStr, orgId);
    //     console.log('noteInfo', noteInfo);
    //     if (noteInfo.dateCheck()) {
    //         const addNoteRes = await Notes.submitNotes(noteInfo);
    //         InterAction.fnShowToast('提交成功', InteractionEnum.DD_SHOW_TOAST_TYPE_SUCCESS, InteractionEnum.DD_SHOW_TOAST_DURATION);
    //         this.setData({
    //             noteText: ''
    //         });
    //         setTimeout(function () {
    //             // Navigate.navigateBack(1);
    //             // Navigate.navigateTo(`${PageUrlConstant.conferenceDetail}?mid=` + mid);
    //             // 跳转改刷新
    //             that._initCurrentConferenceUserNote();
    //         }, 2000);
    //     }
    // },

    async formSubmit(e) {
        let that = this;
        const mid = this.data.mid ? this.data.mid : Caching.getStorageSync('mid');
        console.log('uid', Caching.getStorageSync('currentUser'));
        const uid = Caching.getStorageSync('currentUser').basicCurrentUserInfo.userid;
        const text = e.detail.value.text ? e.detail.value.text : this.data.pngUrl;
        let imgsStr = ' ';
        if (this.data.totalImgIdArr.length > 0) {// 有图片才能上传
            imgsStr = this.data.totalImgIdArr.join(',');
        }
        const orgId = Caching.getStorageSync('orgId');

        const noteInfo = new NoteInfo(mid, uid, text, imgsStr, orgId);
        console.log('noteInfo', noteInfo);
        if (noteInfo.dateCheck()) {
            InterAction.fnShowLoading('加载中');
            const addNoteRes = await Notes.submitNotes(noteInfo);
            this.setData({
                noteText: '',
                isShowWritePng: false
            });
            setTimeout(() => {
                // Navigate.navigateBack(1);
                // Navigate.navigateTo(`${PageUrlConstant.conferenceDetail}?mid=` + mid);
                // 跳转改刷新
                that._initCurrentConferenceUserNote();
            }, 2000);
            InterAction.fnHideLoading();
            InterAction.fnShowToast('提交成功', 'success', 2000);
        }
    },

    tapText(e) {
        console.log(`tapText`);
        dd.navigateTo({url: '/page/conference/write/write'});
    },

    /**
     * 初始化当前会议的用户笔记列表
     * @returns {Promise<void>}
     */
    async _initCurrentConferenceUserNote() {
        const userId = Caching.getStorageSync('currentUser').basicCurrentUserInfo.userid;
        const noteList = await Notes.getUserNoteList(this.data.mid ? this.data.mid : Caching.getStorageSync('mid'), userId);
        console.log(`noteList`, noteList);
        if (noteList) {
            this.setData({
                noteList: noteList.data.reverse(),
            });
        }
    },

    /**
     * 显示图片
     * @param e
     */
    showImage(e) {
        console.log(e)
        let imgArr = this.data.imgArr;
        let itemIndex = e.currentTarget.dataset.id;

        dd.previewImage({
            current: itemIndex, // 当前显示图片的http链接
            urls: imgArr // 需要预览的图片http链接列表
        })
    },

    /**
     * 选择图片
     */
    chooseImage() {
        let that = this;
        dd.chooseImage({
            count: 100 - that.data.imgArr.length,//最多选择4张图片
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: async function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                // console.log('返回选定照片的本地文件路径列表');
                // console.log(res);
                // console.log(res.apFilePaths);
                if (res.apFilePaths.count == 0) {
                    return;
                }
                //上传图片
                // dd.showLoading({
                //     content: '上传中...'
                // });
                let totalImgIdArr = that.data.totalImgIdArr;
                let flag = that.data.uploadFlag;
                console.log('totalImgIdArr开始')
                console.log(totalImgIdArr)
                InterAction.fnShowLoading('上传中');
                for (let i = 0; i < res.filePaths.length; i++) {
                    let img = await Upload.uploadImg(res.filePaths[i], 'img');
                    InterAction.fnHideLoading();
                    let imgObj = JSON.parse(img.data);
                    if (imgObj.code === 1) {
                        totalImgIdArr.push(parseInt(imgObj.data.id));
                        flag = true;
                    } else {
                        flag = false;
                        InterAction.fnAlert('抱歉', `图片${totalImgIdArr.length + i + 1}拉取失败，请删除并重新选择`, '好的');
                        // InterAction.fnShowToast()
                    }
                }
                ;
                // dd.hideLoading();
                that.setData({
                    cacheImg: res.filePaths[0],
                    totalImgIdArr: totalImgIdArr,
                    uploadFlag: flag
                })


                //显示图片
                let imgArrNow = that.data.imgArr;
                imgArrNow = imgArrNow.concat(res.apFilePaths);
                console.log(imgArrNow);
                that.setData({
                    imgArr: imgArrNow
                });

                console.log('totalImgIdArr')
                console.log(totalImgIdArr)
                that.chooseViewShow();
            }
        })
    },

    /**
     * 是否隐藏图片选择
     */
    chooseViewShow() {
        if (this.data.imgArr.length >= 100) {
            this.setData({
                chooseViewShow: false
            })
        } else {
            this.setData({
                chooseViewShow: true
            })
        }
    },


})



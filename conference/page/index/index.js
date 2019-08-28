let app = getApp();


//内网穿透工具介绍:
// https://open-doc.dingtalk.com/microapp/debug/ucof2g
//替换成开发者后台设置的安全域名
// let domain = "http://127.0.0.1:8888";
let domain = "http://tabjin.vaiwan.com";//这边不需要加端口

let url = domain + '/login';

Page({
	data: {
		corpId: '',
		authCode: '',
		userId: '',
		userName: '',
		hideList: true,
	},
	loginSystem() {
		dd.showLoading();
		// 获取小程序免登授权码，这边是企业应用，个人应用也是可以的（时效5分钟）
		dd.getAuthCode({
			success: (res) => {
				this.setData({
					authCode: res.authCode
				})
				//dd.alert({content: "step1"});
				dd.httpRequest({
					url: url,
					method: 'POST',
					data: {
						authCode: res.authCode
					},
					dataType: 'json',
					success: (res) => {
						// dd.alert({content: "step2"});
						console.log('success----', res)
						let userId = res.data.result.userId;
						let userName = res.data.result.userName;
						this.setData({
							userId: userId,
							userName: userName,
							hideList: false
						})
					},
					fail: (res) => {
						console.log("httpRequestFail---", res)
						dd.alert({ content: JSON.stringify(res) });
					},
					complete: (res) => {
						dd.hideLoading();
					}

				});
			},
			fail: (err) => {
				// dd.alert({content: "step3"});
				dd.alert({
					content: JSON.stringify(err)
				})
			}
		})

	},
	onLoad() {

		let _this = this;

		this.setData({
			corpId: app.globalData.corpId
		})

		//dd.alert({content: "step1"});
	},

    /**
     * 根据url保存文件到我的钉盘、企业钉盘
     */
	saveFileToDingPlate(url) {
		console.log('上传文件');
		// 转存文件到钉盘
		dd.saveFileToDingTalk({
			url: "http://tglive-qa.oss-cn-hangzhou.aliyuncs.com/admin/source2018022510025548318668-c170-43a2-bce3-462ab20a207d.doc",  // 文件在第三方服务器地址
			name: "source2018022510025548318668-c170-43a2-bce3-462ab20a207d.doc",
			success: (res) => {
				console.log(JSON.stringify(res))
				console.log(JSON.stringify(res.data))
				console.log(JSON.stringify(res.data[0].spaceId))
				console.log(JSON.stringify(res.data[0].fileId))
				console.log(JSON.stringify(res.data[0].fileName))
				console.log(JSON.stringify(res.data[0].fileSize))
				console.log(JSON.stringify(res.data[0].fileType))
				// 预览文件
				dd.previewFileInDingTalk({
					corpId: "ding44bff8b1633ae32e35c2f4657eb6378f",
					spaceId: res.data[0].spaceId,
					fileId: res.data[0].fileId,
					fileName: res.data[0].fileName,
					fileSize: res.data[0].fileSize,
					fileType: res.data[0].fileType
				})
			},
			fail: (err) => {
				dd.alert({
					content: JSON.stringify(err)
				})
			}
		})
	},

    /**
     * 上传附件到钉盘/从钉盘选择文件
     */
<<<<<<< HEAD
    uploadFileToDingTalk() {
        dd.uploadAttachmentToDingTalk({
            image: { multiple: true, compress: false, max: 9, spaceId: "1837002072" },
            space: { spaceId: "1837002072", isCopy: 1, max: 9 },
            file: { spaceId: "1837002072", max: 1 },
            types: ["photo", "camera", "file", "space"],//PC端仅支持["photo","file","space"]
            success: (res) => {
                console.log(res);
=======
	uploadFileToDingTalk() {

		// TODO 调用grantCustomSpace接口 授权用户访问企业自定义空间
		dd.httpRequest({
			headers: {
				"Content-Type": "application/json;charset=UTF-8"
			},
			url: domain + '/grantCustomSpace',
			method: 'GET',
			data: {},
			dataType: 'json',
			success: function (res) {
				dd.alert({ content: 'success' });
				console.log(res);
			},
			// fail: function (res) {
			// 	dd.alert({ content: 'fail' });
			// 	console.log(res);
			// },
			complete: function (res) {
				dd.alert({ content: 'complete' });
				console.log(res);
			}
		});
>>>>>>> f246b553d4b64d1aa2e9d9e0aebd786cdb7fc9e3

		dd.uploadAttachmentToDingTalk({
			image: { multiple: true, compress: false, max: 9, spaceId: "1837002072" },
			space: { spaceId: "1837002072", isCopy: 1, max: 9 },
			file: { spaceId: "1837002072", max: 1 },
			types: ["photo", "camera", "file", "space"],//PC端仅支持["photo","file","space"]
			success: (res) => {
				console.log(res);
			},
			fail: (err) => {
				dd.alert({
					content: JSON.stringify(err)
				})
			}
		})
	},


})
//index.js
//获取应用实例
const app = getApp();
const WaterMarker = require('../../utils/waterMark.js');

const WM = new WaterMarker();
var Config = {
  colorMap: [
    ['0', '#ffffff'],
    ['1', '#979797'],
    ['2', '#000000']
  ],
  waterMarkConfig: {
    color: '#ffffff',
    opacity: 0.5
  },
  text: '此证件仅供办理XX业务使用，他用无效',
  debounceDelay: 200
};

Page({
  data: {
    canvasW: 100,
    canvasH: 240,
    inputFocus: false
  },
  onReady: function (event) {
    this.getDefaultConfig();
  },
  touchImgstart: function (event) {
    this.setData({
      touch: event.changedTouches[0]
    });
  },
  touchImgend: function (event) {
    var start = this.data.touch,
      end = event.changedTouches[0];
    if (Math.abs(start.clientX - end.clientX) < 10 && Math.abs(start.clientY - end.clientY) < 10) {
      this.chooseImg();
    }
  },
  chooseImg: function (event) {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: function (res1) {
        wx.getImageInfo({
          src: res1.tempFilePaths[0],
          success: function (res) {
            var imgW = res.width,
              imgH = res.height;
            var windowWidth = wx.getSystemInfoSync().windowWidth;

            var scale = windowWidth / imgW;
            var canvasHeight = windowWidth * imgH / imgW;
            that.setData({
              canvasW: windowWidth,
              canvasH: canvasHeight,
              imgW: imgW,
              imgH: imgH
            });

            var config = {
              text: that.data.text,
              id: "myCanvas",
              color: '#ffffff',
              xStart: 0,
              yStart: -(res.width * 0.71),
              xSpace: 60,
              ySpace: 60,
              rotate: 45,
              opacity: 0.5,
              width: windowWidth,
              height: canvasHeight,
              scale: scale,
              size: 30,
              imgUrl: res1.tempFilePaths[0]
            };
            config = Object.assign(config, Config.waterMarkConfig);

            WM.mark(config).then(function () {
              that.log(1);
              that.setData({
                draw: true
              });
            });
          }
        })
      }
    });
  },
  sameImg: function (event) {
    if (!this.data.draw) return false;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      destWidth: this.data.imgW,
      destHeight: this.data.imgH,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: '已保存到相册',
              icon: 'success',
              duration: 2000
            })
          }
        });
      }
    });
    this.log(3);
  },
  previewImg: function () {
    if (!this.data.draw) return false;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      destWidth: this.data.imgW,
      destHeight: this.data.imgH,
      success: function (res) {
        wx.previewImage({
          urls: [res.tempFilePath]
        })
      }
    });
  },
  handleCircleClick: function (event) {
    var id = event.target.id;
    if (!id) return;
    var that = this;
    this.setData({
      currentColorIndex: id
    }, function () {
      if (!that.data.draw) return false;
      WM.reRendering({
        color: that.data.ColorMap[that.data.currentColorIndex][1]
      });
      that.log(1);
    });
  },
  handleTextChange: debounce(function (event) {
    if (this.data.draw) WM.reRendering({
      text: event.detail.value
    });
  }, Config.debounceDelay),
  handleTextFocus: function (event) {
    this.setData({
      inputFocus: true
    });
  },
  handleTextBlur: function (event) {
    var prevText = this.data.text,
      that = this;
    this.setData({
      inputFocus: false,
      text: event.detail.value
    }, function () {
      if (that.data.draw && prevText !== that.data.text) that.log(1);
    })
  },
  log: function (type) {
    var that = this;
    wx.request({
      url: 'https://www.simpletool.cn/api/log',
      method: 'POST',
      dataType: 'json',
      data: {
        clientType: 0,
        logMessageType: type,
        logMessageContent: that.data.text,
        waterColor: that.data.ColorMap[that.data.currentColorIndex][1]
      }
    });
  },
  getDefaultConfig: function () {
    var that = this;
    wx.request({
      url: 'https://www.simpletool.cn/api/waterConfig/2',
      dataType: 'json',
      success: function (res) {
        if (res.statusCode == 200) {
          Config = Object.assign(Config, res.data);
        }
      },
      complete: function () {
        var colorMap = Config.colorMap,
          waterMarkConfig = Config.waterMarkConfig,
          defaultColor = colorMap.filter(function (color) {
            return color[1] == waterMarkConfig.color;
          });
        that.setData({
          ColorMap: colorMap,
          currentColorIndex: defaultColor.length ? defaultColor[0][0] : -1,
          defaultText: Config.text,
          text: Config.text
        });
      }
    });
  },
  reward: function () {
    wx.previewImage({
      urls: ['https://www.simpletool.cn/static/money.jpg']
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '水印小助手',
      path: 'pages/waterMarker/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})

function debounce(func, wait) {
  var timeout, args, context, timestamp, result;

  var later = function () {
    var last = new Date().getTime() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  };

  return function () {
    context = this;
    args = arguments;
    timestamp = new Date().getTime();
    if (!timeout) timeout = setTimeout(later, wait);
    return result;
  };
};

function extend(origin, target) {
  for (var key in target) {
    target.hasOwnProperty(key) && (origin[key] = target[key]);
  }
  return origin;
}
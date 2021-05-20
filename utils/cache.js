//清除所有缓存
function clear() {
  wx.clearStorageSync();
}

//缓存对象
function cacheValue(cacheKey, cacheInfo, isSync = true) {
  if (!cacheInfo) {
    return false;
  }
  if (isSync) {
    wx.setStorageSync(cacheKey, JSON.stringify(cacheInfo))
  } else {        
    wx.setStorage({
      key: cacheKey,
      data: JSON.stringify(cacheInfo),
    })
  }
  return true;
}

//缓存对象
function getCacheValue(cacheKey, callback = null) {
  if (!cacheKey) {
    return null;
  }
  try {
    if ((callback && typeof (callback) === "function")) {   
      //异步获取
      wx.getStorage({
        key: cacheKey,
        success: function (res) {
          if ((callback && typeof (callback) === "function")) {
            callback(JSON.parse(res.data))
          }
        }
      })
    } else {    
      //同步获取
      let res = wx.getStorageSync(cacheKey)
      if(res) {
        return JSON.parse(res);
      }
      return "";
    }
  } catch (error) {
    console.log(error)
  }
}


function setToken(token) {
  wx.setStorageSync("token", token);
}
function getToken() {
  return wx.getStorageSync("token");
}
function isLogin() {
  //return getMember() ? true : false
}


module.exports = {
  clear: clear,
  cacheValue: cacheValue,
  getCacheValue: getCacheValue,

  setToken: setToken,
  getToken: getToken,
}

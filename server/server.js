// server.js
let lastCallPayload = null;

exports = {
  // 통화 생성 이벤트 핸들러
  onCallCreateHandler: function (payload) {
    console.log("==== 통화 이벤트 발생 ====");
    console.log("통화 ID:", payload.data && payload.data.call ? payload.data.call.id : "Unknown");

    // 페이로드 데이터 저장
    lastCallPayload = payload;

    // 단순히 이벤트 수신 확인
    return renderData(null, {
      success: true,
      message: "통화 이벤트가 성공적으로 처리되었습니다"
    });
  },

  // 통화 변경 이벤트 핸들러
  onCallUpdateHandler: function (payload) {
    console.log("==== 업데이트 통화 이벤트 발생 ====");
    console.log("통화 ID:", payload.data && payload.data.call ? payload.data.call.id : "Unknown");

    // 페이로드 데이터 저장
    lastCallPayload = payload;

    // 단순히 이벤트 수신 확인
    return renderData(null, {
      success: true,
      message: "통화 이벤트가 성공적으로 처리되었습니다"
    });
  },

  // 마지막 통화 페이로드를 가져오는 메서드
  getLastCallPayload: function () {
    console.log("getLastCallPayload 함수 호출됨");

    if (lastCallPayload) {
      return renderData(null, {
        success: true,
        payload: lastCallPayload,
        timestamp: new Date().toISOString()
      });
    }

    return renderData(null, {
      success: false,
      message: "아직 수신된 통화 데이터가 없습니다"
    });
  }
};
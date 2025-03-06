// server.js
// 전역 변수로 마지막 호출 데이터 저장
let lastCallPayload = null;

exports = {
  // 콜 생성 이벤트 핸들러
  onCallCreateHandler: function(payload) {
    console.log("==== 콜 수신 이벤트 트리거됨 ====");
    console.log("콜 ID:", payload.data && payload.data.call ? payload.data.call.id : "Unknown");
    
    // 페이로드 데이터 로깅 및 저장
    console.log("전체 페이로드:", JSON.stringify(payload, null, 2));
    
    // 중요: 페이로드 데이터 저장
    lastCallPayload = payload;
    
    renderData(null, { 
      success: true,
      message: "콜 이벤트가 성공적으로 처리되었습니다."
    });
  },
  
  // 마지막 콜 페이로드 데이터를 가져오는 서버 메서드
  getLastCallPayload: function() {
    console.log("getLastCallPayload 함수 호출됨, 저장된 데이터:", lastCallPayload ? "있음" : "없음");
    
    // 실제 저장된 콜 데이터가 있는 경우
    if (lastCallPayload) {
      return renderData(null, {
        success: true,
        payload: lastCallPayload,
        timestamp: new Date().toISOString()
      });
    }
    
    // 없는 경우 테스트 데이터 반환
    return renderData(null, {
      success: false,
      message: "아직 수신된 콜 데이터가 없습니다.",
      test_data: {
        "event": "onCallCreate",
        "timestamp": 1740976328671,
        "data": {
          "call": {
            "id": 135,
            "phone_number": "+1234567891",
            "direction": "incoming",
            "created_time": "2025-03-03T04:32:08.671Z",
            "call_notes": "고객이 비행기 취소를 원함",
            "participants": [
              {
                "participant_type": "Customer",
                "caller_number": "+11234568791",
                "call_status": 0
              },
              {
                "participant_type": "Agent",
                "call_status": 8
              }
            ]
          }
        }
      }
    });
  }
};
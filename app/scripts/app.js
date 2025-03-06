/**
 * app/scripts/app.js - 클라이언트 측 로직
 * 전화가 걸려올 때 모달을 표시하는 기능 구현
 */

(function() {
  // 클라이언트 인스턴스
  console.log('앱 로드 중...');
  let client;
  let callListenerRegistered = false;
  
  // 앱 초기화
  async function initializeApp() {
    try {
      // 클라이언트 초기화
      client = await app.initialized();
      console.log('앱 초기화 성공');
      
      // 통화 리스너 설정
      setupCallListener();
      
      // 버튼 이벤트 설정
      setupButtons();
      
      // 상태 표시
      displayStatus('success', '앱이 성공적으로 로드되었습니다. 전화 이벤트 대기 중...');
    } catch (error) {
      handleAppInitError(error);
    }
  }
  
  // 통화 이벤트 리스너 설정
  async function setupCallListener() {
    try {
      if (callListenerRegistered) return;
      
      // onCallCreate 이벤트 리스너 등록
      await client.events.on('onCallCreate', function(event) {
        console.log('통화 생성 이벤트 감지됨:', event);
        showCallerInfoModal();
      });
      
      callListenerRegistered = true;
      console.log('통화 생성 이벤트 리스너가 등록되었습니다.');
    } catch (error) {
      console.error('통화 리스너 설정 오류:', error);
      displayStatus('error', '통화 감지 설정 오류: ' + error.message);
    }
  }
  
  // 발신자 정보 모달 표시
  async function showCallerInfoModal() {
    try {
      console.log('발신자 정보 모달 표시 시도 중...');
      
      await client.interface.trigger('showModal', {
        title: '새로운 전화 수신',
        template: 'caller_modal.html'
      });
      
      console.log('발신자 정보 모달이 표시되었습니다.');
    } catch (error) {
      console.error('모달 표시 오류:', error);
      displayStatus('error', '모달 표시 오류: ' + error.message);
    }
  }
  
  // 버튼 이벤트 설정
  function setupButtons() {
    // 모달 테스트 버튼
    const showModalBtn = document.getElementById('showModalBtn');
    if (showModalBtn) {
      showModalBtn.addEventListener('click', showCallerInfoModal);
    }
    
    // 통화 정보 버튼
    const callBtn = document.getElementById('callBtn');
    if (callBtn) {
      callBtn.addEventListener('click', fetchCallData);
    }
    
    // 테스트 데이터 버튼
    const testBtn = document.getElementById('testBtn');
    if (testBtn) {
      testBtn.addEventListener('click', showTestData);
    }
    
    // 화면 지우기 버튼
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        document.getElementById('payload-display').innerHTML = '<p>화면이 지워졌습니다. 버튼을 클릭하여 데이터를 가져오세요...</p>';
      });
    }
  }
  
  // 통화 데이터 가져오기
  async function fetchCallData() {
    const display = document.getElementById('payload-display');
    if (!display) return;
    
    display.innerHTML = "<p>통화 데이터 가져오는 중...</p>";
    
    try {
      const response = await client.request.invoke('getLastCallPayload', {});
      
      if (response && response.response) {
        const data = response.response;
        
        if (data.success && data.payload) {
          formatCallData(data.payload, display);
        } else if (data.test_data) {
          formatCallData(data.test_data, display);
          display.innerHTML += `
            <div class="message info">
              <strong>참고:</strong> 실제 통화 데이터가 없어 테스트 데이터를 표시합니다.
            </div>
          `;
        } else {
          display.innerHTML = `
            <div class="message warning">
              ${data.message || "실제 통화 데이터가 없습니다."}
            </div>
          `;
        }
      } else {
        display.innerHTML = `
          <div class="message error">
            서버로부터 올바른 응답을 받지 못했습니다.
          </div>
        `;
      }
    } catch (error) {
      console.error('통화 데이터 가져오기 오류:', error);
      display.innerHTML = `
        <div class="message error">
          오류: ${error.message}
        </div>
      `;
    }
  }
  
  // 통화 데이터 포맷팅
  function formatCallData(payload, display) {
    try {
      const callData = payload.data && payload.data.call ? payload.data.call : null;
      
      if (!callData) {
        display.innerHTML = `
          <div class="message warning">
            통화 데이터를 찾을 수 없습니다.
          </div>
          <pre>${JSON.stringify(payload, null, 2)}</pre>
        `;
        return;
      }
      
      // 고객 정보 추출
      let customerInfo = { caller_number: "알 수 없음" };
      if (callData.participants && Array.isArray(callData.participants)) {
        const customer = callData.participants.find(p => p.participant_type === "Customer");
        if (customer) {
          customerInfo = customer;
        }
      }
      
      // 통화 방향
      const directionText = callData.direction === "incoming" ? "수신" : 
                          callData.direction === "outgoing" ? "발신" : "알 수 없음";
      
      // HTML로 형식화
      display.innerHTML = `
        <div class="call-info-card">
          <h3>통화 정보</h3>
          <table class="info-table">
            <tr>
              <th>통화 ID:</th>
              <td>${callData.id || "알 수 없음"}</td>
            </tr>
            <tr>
              <th>방향:</th>
              <td>${directionText}</td>
            </tr>
            <tr>
              <th>전화번호:</th>
              <td>${callData.phone_number || "알 수 없음"}</td>
            </tr>
            <tr>
              <th>고객 번호:</th>
              <td>${customerInfo.caller_number || "알 수 없음"}</td>
            </tr>
            <tr>
              <th>통화 시작:</th>
              <td>${callData.created_time ? new Date(callData.created_time).toLocaleString() : "알 수 없음"}</td>
            </tr>
            ${callData.call_notes ? `
            <tr>
              <th>메모:</th>
              <td>${callData.call_notes}</td>
            </tr>
            ` : ''}
          </table>
          
          <div style="margin-top: 15px;">
            <fw-button color="primary" id="showModalWithData">모달로 보기</fw-button>
          </div>
        </div>
      `;
      
      // 모달로 보기 버튼 이벤트
      const showModalBtn = document.getElementById('showModalWithData');
      if (showModalBtn) {
        showModalBtn.addEventListener('click', showCallerInfoModal);
      }
    } catch (error) {
      console.error('통화 데이터 형식화 오류:', error);
      display.innerHTML = `
        <div class="message error">
          통화 데이터 형식화 오류: ${error.message}
        </div>
        <pre>${JSON.stringify(payload, null, 2)}</pre>
      `;
    }
  }
  
  // 테스트 데이터 표시
  function showTestData() {
    const display = document.getElementById('payload-display');
    if (!display) return;
    
    // 테스트 통화 데이터
    const testData = {
      "event": "onCallCreate",
      "timestamp": Date.now(),
      "data": {
        "call": {
          "id": 12345,
          "phone_number": "+1234567890",
          "direction": "incoming",
          "created_time": new Date().toISOString(),
          "call_notes": "고객이 항공편 예약 관련 문의",
          "participants": [
            {
              "participant_type": "Customer",
              "caller_number": "+1234567890",
              "call_status": 0
            },
            {
              "participant_type": "Agent",
              "call_status": 8
            }
          ]
        }
      }
    };
    
    formatCallData(testData, display);
  }
  
  // 상태 표시 함수
  function displayStatus(type, message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.className = `message ${type}`;
      statusElement.textContent = message;
    }
  }
  
  // 앱 초기화 에러 핸들러
  function handleAppInitError(error) {
    console.error('앱 초기화 실패:', error);
    displayStatus('error', '초기화 오류: ' + error.message);
  }
  
  // DOM 로드 완료 시 앱 초기화
  document.addEventListener('DOMContentLoaded', initializeApp);
})();
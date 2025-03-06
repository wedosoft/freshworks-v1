/**
 * app/scripts/app.js - 개선된 클라이언트 측 로직
 */

// 전역 변수 제거, 모듈 패턴 사용
(function() {
  // 클라이언트를 안전하게 초기화하는 주 함수
  async function initializeApp() {
    try {
      // 클라이언트 초기화 (단일 스코프에서 처리)
      const client = await app.initialized();
      console.log('앱 초기화 성공');

      // 이벤트 설정
      setupAppEvents(client);
      
      // 초기 데이터 로드
      await safelyFetchInitialData(client);
    } catch (error) {
      handleAppInitError(error);
    }
  }

  // 앱 이벤트 설정 함수 (복잡성 감소)
  function setupAppEvents(client) {
    client.events.on('app.activated', handleAppActivation);
  }

  // 앱 활성화 처리 핸들러
  async function handleAppActivation() {
    console.log('앱 활성화 이벤트 트리거됨');
    await displayCallStatus('success', '앱이 성공적으로 로드되었습니다.');
  }

  // 초기 데이터 안전하게 가져오기
  async function safelyFetchInitialData(client) {
    try {
      // 데이터 로드 로직 간소화
      const contextData = await client.context.getContext();
      displayPayloadData(contextData, 'Context API');
    } catch (error) {
      console.warn('초기 데이터 로드 실패:', error);
      displayFallbackData();
    }
  }

  // 통화 상태 표시 함수
  function displayCallStatus(type, message) {
    const statusElement = document.getElementById('status');
    if (!statusElement) return;

    statusElement.className = `message ${type}`;
    statusElement.innerHTML = `
      <p><strong>${getStatusIcon(type)}</strong> ${message}</p>
      <p>시간: ${new Date().toLocaleTimeString()}</p>
    `;
  }

  // 상태 아이콘 반환
  function getStatusIcon(type) {
    switch(type) {
      case 'success': return '✓';
      case 'error': return '✗';
      default: return 'ℹ';
    }
  }

  // 페이로드 데이터 표시
  function displayPayloadData(data, source) {
    const payloadElement = document.getElementById('payload-display');
    if (!payloadElement) return;

    try {
      const formattedData = JSON.stringify(data || {}, null, 2);
      payloadElement.innerHTML = `
        <h3>${source || 'API'} 데이터:</h3>
        <pre>${escapeHtml(formattedData)}</pre>
      `;
    } catch (error) {
      payloadElement.innerHTML = `
        <div class="message error">
          데이터 표시 중 오류 발생: ${error.message}
        </div>
      `;
    }
  }

  // 대체 데이터 표시
  function displayFallbackData() {
    const payloadElement = document.getElementById('payload-display');
    if (!payloadElement) return;

    payloadElement.innerHTML = `
      <div class="message warning">
        <p>기본 데이터 로드</p>
        <p>현재 시간: ${new Date().toISOString()}</p>
      </div>
    `;
  }

  // HTML 이스케이프 함수 (XSS 방지)
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 앱 초기화 에러 핸들러
  function handleAppInitError(error) {
    console.error('앱 초기화 실패:', error);
    displayCallStatus('error', `초기화 오류: ${error.message}`);
  }

  // DOM 로드 완료 시 앱 초기화
  document.addEventListener('DOMContentLoaded', initializeApp);
})();
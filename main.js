/*
  main.js
  목적
  1) Lucide 아이콘을 i[data-lucide] -> svg로 변환
  2) 이메일 주소 클릭 시 클립보드 복사 (mailto 사용하지 않음)
  3) 임시 링크(href="#", data-disabled-link="true")는 클릭 동작을 막음
  4) 페이지 진입 애니메이션을 확실히 트리거 (bfcache 포함)

  사용 방법
  - index.html / about.html 하단에 다음 2개 스크립트를 defer로 포함
    <script defer src="https://unpkg.com/lucide@latest"></script>
    <script defer src="./main.js"></script>

  주의
  - lucide 스크립트가 main.js보다 먼저 로드되어야 함 (script 태그 순서 유지)
*/

(function () {
  "use strict";

  function initLucide() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function showToast(toastEl) {
    if (!toastEl) return;
    toastEl.classList.add("show");
    window.clearTimeout(toastEl.__t);
    toastEl.__t = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 900);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      return false;
    }
  }

  function fallbackSelectText(btn) {
    try {
      var sel = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(btn);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {
      /* ignore */
    }
  }

  function initCopyButtons() {
    var buttons = document.querySelectorAll(".copy-text[data-copy]");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var text = btn.getAttribute("data-copy") || "";
        var row = btn.closest(".contact-row");
        var toast = row ? row.querySelector(".copy-toast") : null;

        var ok = await copyToClipboard(text);
        if (ok) {
          showToast(toast);
        } else {
          fallbackSelectText(btn);
        }
      });
    });
  }

  function disablePlaceholderLinks() {
    /*
      href="#" + data-disabled-link="true" 인 링크는 임시 상태로 간주
      - 클릭 시 페이지가 위로 튀는 현상을 방지
      - 실제 링크 연결 시:
        1) href를 실제 URL로 변경
        2) data-disabled-link="true" 속성 삭제
    */
    var links = document.querySelectorAll('a[data-disabled-link="true"]');
    if (!links.length) return;

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  function triggerPageEnter() {
    /*
      CSS 애니메이션 트리거 방식:
      - .page-enter는 기본적으로 opacity 0 상태
      - body.is-ready가 붙는 순간 animation 실행

      bfcache(뒤/앞으로가기)에서는 CSS animation이 재생되지 않는 경우가 있어
      pageshow 이벤트(persisted=true)에서도 재트리거 처리
    */
    function run() {
      document.body.classList.remove("is-ready");
      // 다음 프레임에서 클래스 추가 -> 애니메이션 확실히 발동
      window.requestAnimationFrame(function () {
        document.body.classList.add("is-ready");
      });
    }

    run();

    window.addEventListener("pageshow", function (e) {
      // bfcache로 복원된 경우에도 다시 트리거
      if (e && e.persisted) run();
    });
  }

  function boot() {
    initLucide();
    initCopyButtons();
    disablePlaceholderLinks();
    triggerPageEnter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

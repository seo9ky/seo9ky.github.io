/*
  main.js
  목적
  1) Lucide 아이콘을 i[data-lucide] -> svg로 변환
  2) 이메일 주소 클릭 시 클립보드 복사 (mailto 사용하지 않음)
  3) 페이지 진입 시 페이드 + 살짝 내려오는 효과 트리거 (bfcache/pageshow 포함)

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
        if (ok) showToast(toast);
        else fallbackSelectText(btn);
      });
    });
  }

  /* 페이지 진입 애니메이션 트리거
     - CSS는 body.page-enter 상태에서만 애니메이션이 동작하도록 구성 */
  function triggerPageEnter() {
    // prefers-reduced-motion 사용자는 애니메이션을 건너뜀
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
    } catch (e) {
      /* ignore */
    }

    // 클래스 제거 -> reflow -> 클래스 추가 로 애니메이션 재시작 보장
    document.body.classList.remove("page-enter");
    void document.body.offsetWidth;
    document.body.classList.add("page-enter");
  }

  function boot() {
    initLucide();
    initCopyButtons();
    triggerPageEnter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // GitHub Pages/브라우저의 bfcache(뒤로가기/앞으로가기)에서도 효과가 보이도록
  window.addEventListener("pageshow", function () {
    triggerPageEnter();
  });
})();

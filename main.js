/*
  main.js
  목적
  1) Lucide 아이콘을 i[data-lucide] -> svg로 변환
  2) 이메일 주소 클릭 시 클립보드 복사 (mailto 사용하지 않음)
  3) data-link-key 기반으로 URL 맵을 한 곳에서 관리하고 자동으로 href 주입
  4) 페이지 진입 애니메이션 트리거 (bfcache 포함)

  사용 방법
  - index.html / about.html 하단에 다음 2개 스크립트를 defer로 포함
    <script defer src="https://unpkg.com/lucide@latest"></script>
    <script defer src="./main.js"></script>
*/

(function () {
  "use strict";

  /* =========================================================
     0) 링크 맵 (여기만 수정)
     - key: HTML 요소의 data-link-key 값
     - url: 연결할 URL (비워두거나 null이면 비활성 유지)
     - newTab: true면 새 탭으로 열기(target=_blank, rel=noopener)
     ========================================================= */
  var LINK_MAP = {
    // index.html
    "idx.mm.icon":     { url: "", newTab: true },
    "idx.mm.text":     { url: "", newTab: true },
    "idx.mm.image":    { url: "", newTab: true },
    "idx.mm.audio":    { url: "", newTab: true },

    "idx.dt.icon":     { url: "", newTab: true },
    "idx.dt.mental":   { url: "", newTab: true },
    "idx.dt.oph":      { url: "", newTab: true },
    "idx.dt.audio":    { url: "", newTab: true },

    "idx.proj.mind":   { url: "", newTab: true },
    "idx.proj.biasqa": { url: "", newTab: true },

    // about.html
    "abt.edu.skku":    { url: "", newTab: true },
    "abt.exp.dsail":   { url: "", newTab: true }
  };

  /* =========================================================
     1) Lucide 아이콘 초기화
     ========================================================= */
  function initLucide() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* =========================================================
     2) Copy-to-clipboard
     ========================================================= */
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

  /* =========================================================
     3) data-link-key -> href 자동 주입
     - URL이 비어있으면: placeholder 유지 + 클릭 방지
     - URL이 있으면: href/target/rel 세팅
     ========================================================= */
  function normalizeUrl(value) {
    if (value == null) return "";
    return String(value).trim();
  }

  function applyLinkToAnchor(a, cfg) {
    var url = normalizeUrl(cfg && cfg.url);
    var openNew = !!(cfg && cfg.newTab);

    if (!url) {
      // 비활성 링크: 클릭 시 페이지 점프 방지
      a.setAttribute("href", "#");
      a.setAttribute("data-disabled-link", "true");
      a.classList.add("is-disabled-link");
      a.removeAttribute("target");
      a.removeAttribute("rel");
      return;
    }

    // 활성 링크
    a.setAttribute("href", url);
    a.removeAttribute("data-disabled-link");
    a.classList.remove("is-disabled-link");

    if (openNew) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    } else {
      a.removeAttribute("target");
      a.removeAttribute("rel");
    }
  }

  function initAutoLinks() {
    var nodes = document.querySelectorAll("a[data-link-key]");
    if (!nodes.length) return;

    nodes.forEach(function (a) {
      var key = a.getAttribute("data-link-key") || "";
      var cfg = LINK_MAP[key];

      // 맵에 키가 없으면 실수 방지를 위해 비활성 처리
      if (!cfg) cfg = { url: "", newTab: true };

      applyLinkToAnchor(a, cfg);
    });
  }

  function disablePlaceholderLinks() {
    var links = document.querySelectorAll('a[data-disabled-link="true"]');
    if (!links.length) return;

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  /* =========================================================
     4) Page Enter Animation 트리거
     - CSS는 body.is-ready가 있을 때만 애니메이션을 시작
     - bfcache 복원(pageshow persisted)에서도 다시 트리거
     ========================================================= */
  function triggerPageEnter() {
    function run() {
      // 강제로 reflow를 유도해서 애니메이션이 항상 재시작되게 함
      document.body.classList.remove("is-ready");
      void document.body.offsetWidth;
      document.body.classList.add("is-ready");
    }

    run();

    window.addEventListener("pageshow", function (e) {
      // Safari/모바일에서 뒤로가기(bfcache) 복원 시 애니메이션이 안 도는 문제 방지
      if (e && e.persisted) run();
    });
  }

  function boot() {
    initLucide();
    initAutoLinks();
    disablePlaceholderLinks();
    initCopyButtons();
    triggerPageEnter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

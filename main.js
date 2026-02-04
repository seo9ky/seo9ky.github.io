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

  /* =========================================================
     3) data-link-key -> href 자동 주입
     - URL이 비어있으면: 클릭 막기(placeholder)
     - URL이 있으면: href/target/rel 세팅
     ========================================================= */
  function normalizeUrl(value) {
    if (value == null) return "";
    var url = String(value).trim();
    return url;
  }

  function applyLinkToAnchor(a, cfg) {
    var url = normalizeUrl(cfg && cfg.url);
    var openNew = !!(cfg && cfg.newTab);

    if (!url) {
      // 비활성: href="#" 유지 + 클릭 방지 플래그 + 스타일용 클래스
      a.setAttribute("href", "#");
      a.setAttribute("data-disabled-link", "true");
      a.classList.add("is-disabled-link");
      a.removeAttribute("target");
      a.removeAttribute("rel");
      return;
    }

    // 활성 링크 적용
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
    /*
      사용 방법:
      1) HTML에서 <a data-link-key="..."> 를 붙인다.
      2) main.js의 LINK_MAP에서 같은 key에 url을 넣는다.
         - url이 비어있으면 비활성(클릭 막힘)
         - url이 있으면 자동 연결
    */
    var nodes = document.querySelectorAll("a[data-link-key]");
    if (!nodes.length) return;

    nodes.forEach(function (a) {
      var key = a.getAttribute("data-link-key") || "";
      var cfg = LINK_MAP[key];

      // cfg가 없으면 실수 방지를 위해 비활성 처리
      if (!cfg) cfg = { url: "", newTab: true };

      applyLinkToAnchor(a, cfg);
    });
  }

  function disablePlaceholderLinks() {
    // 비활성 링크(placeholder)는 클릭 시 페이지 점프 방지
    var links = document.querySelectorAll('a[data-disabled-link="true"]');
    if (!links.length) return;

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  function triggerPageEnter() {
    function run() {
      document.body.classList.remove("is-ready");
      window.requestAnimationFrame(function () {
        document.body.classList.add("is-ready");
      });
    }

    run();

    window.addEventListener("pageshow", function (e) {
      if (e && e.persisted) run();
    });
  }

  function boot() {
    initLucide();

    // 링크 자동 주입은 아이콘 svg 변환과 무관하지만,
    // DOM이 준비된 시점에 한번만 적용하면 된다.
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

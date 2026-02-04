/*
  main.js
  목적
  1) Lucide 아이콘을 i[data-lucide] -> svg로 변환
  2) 이메일 주소 클릭 시 클립보드 복사 (mailto 사용하지 않음)
  3) data-link-key 기반 URL 맵을 한 곳에서 관리하고 자동으로 href 주입

  사용 방법
  - index.html / about.html 하단에 다음 2개 스크립트를 defer로 포함
    <script defer src="https://unpkg.com/lucide@latest"></script>
    <script defer src="./main.js"></script>
*/

(function () {
  "use strict";

  /*
    LINK_MAP: 여기만 수정하면 자동으로 링크가 붙습니다.
    - key: HTML 요소의 data-link-key 값
    - url: 연결할 URL (빈 문자열이면 비활성)
    - newTab: true면 새 탭으로 열기
  */
  var LINK_MAP = {
    // index.html
    "idx.mm.icon": { url: "", newTab: true },
    "idx.mm.text": { url: "", newTab: true },
    "idx.mm.image": { url: "", newTab: true },
    "idx.mm.audio": { url: "", newTab: true },

    "idx.dt.icon": { url: "", newTab: true },
    "idx.dt.mental": { url: "", newTab: true },
    "idx.dt.oph": { url: "", newTab: true },
    "idx.dt.audio": { url: "", newTab: true },

    "idx.proj.mind": { url: "", newTab: true },
    "idx.proj.biasqa": { url: "", newTab: true },

    // about.html
    "abt.edu.skku": { url: "", newTab: true },
    "abt.exp.dsail": { url: "", newTab: true }
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
        if (ok) showToast(toast);
        else fallbackSelectText(btn);
      });
    });
  }

  function normalizeUrl(value) {
    if (value == null) return "";
    return String(value).trim();
  }

  function applyLinkToAnchor(a, cfg) {
    var url = normalizeUrl(cfg && cfg.url);
    var openNew = !!(cfg && cfg.newTab);

    if (!url) {
      a.setAttribute("href", "#");
      a.setAttribute("data-disabled-link", "true");
      a.classList.add("is-disabled-link");
      a.removeAttribute("target");
      a.removeAttribute("rel");
      return;
    }

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

  function boot() {
    initAutoLinks();
    disablePlaceholderLinks();
    initCopyButtons();
    initLucide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

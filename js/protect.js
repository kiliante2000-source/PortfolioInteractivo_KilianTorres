(function protectMedia() {
  const pin = document.createElement("meta");
  pin.setAttribute("name", "pinterest");
  pin.setAttribute("content", "nopin");
  document.head.appendChild(pin);

  const rich = document.createElement("meta");
  rich.setAttribute("name", "pinterest-rich-pin");
  rich.setAttribute("content", "false");
  document.head.appendChild(rich);

  const mark = (el) => {
    if (!el || el.nodeType !== 1) return;
    if (el.matches("img, video, canvas, picture")) {
      el.setAttribute("nopin", "nopin");
      el.setAttribute("draggable", "false");
      if ("decoding" in el) el.decoding = "async";
    }
  };

  const scan = (root) => {
    mark(root);
    root.querySelectorAll?.("img, video, canvas, picture").forEach(mark);
  };

  scan(document);
  new MutationObserver((records) => {
    for (const rec of records) rec.addedNodes.forEach(scan);
  }).observe(document.documentElement, { childList: true, subtree: true });

  const isMedia = (node) =>
    node?.closest?.(
      "img, video, canvas, picture, .portrait, .photo-open, .signature, .folder-viewer-img, .brand-open, .icon-photo, .icon-thumb"
    );

  document.addEventListener("contextmenu", (e) => {
    if (isMedia(e.target)) e.preventDefault();
  });

  document.addEventListener("dragstart", (e) => {
    if (isMedia(e.target)) e.preventDefault();
  });
})();

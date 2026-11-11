/**
 * Morandi Theme Studio — app.js v8 (Format Bridge)
 * Converts Reeden .red, Archive appearance_kit ZIP and MD3 manifest ZIP.
 * Each target is rebuilt in its native structure; no extension-renaming shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── State ──────────────────────────────────────────────────────
  const state = {
    appTheme: 'light',   // 'light' | 'dark'
    mockupMode: 'light', // 'light' | 'dark'
    activeTab: 'preview',
    mobileTab: 'controls', // 'controls' | 'preview'
    queue: [],           // Array of QueueItem
    activeId: null,
    batchMode: 'full',
    exportFormat: 'md3', // 'md3' | 'archive' | 'reeden'
    reedenPair: { uiId: null, readerId: null }
  };

  const REEDEN_LAYOUT_DEFAULTS = {
    letterSpacing: -1.0, lineSpacing: -1.0, paragraphSpacing: -1.0,
    paragraphIndent: 'defaults', titleAlign: 'center', titleFontSizeDiff: 0.0,
    txtTitleFontSizeDiff: 6.5, titleBoldEnabled: false, titleFontBold: 7,
    titleStyleId: null, titlePaddingBottom: 26.0, titleMarginTop: 1.0,
    fontSize: 16.0, fontBold: 1, textFontWeight: 4, contentPaddingTop: 0.0,
    contentPaddingBottom: 0.0, contentAlign: 'defaults', writingMode: 'defaults',
    doublePageType: 'singlePage', autoDoublePageOnVertical: false, doublePageGap: 70.0,
    doublePageDividerWidth: 0.0, pageFrameStyle: 'none', pageFrameWidth: 1.0,
    pageFrameRadius: 0.0, pageFrameOpacity: 40, headerPaddingTop: -2.0,
    headerPaddingBottom: 87.0, headerPaddingLeft: 0.0, headerPaddingRight: 0.0,
    footerPaddingTop: 29.0, footerPaddingBottom: 17.0, footerPaddingLeft: 0.0,
    footerPaddingRight: 0.0, paddingLeft: 21.0, paddingRight: 21.0,
    fontFamily: null, englishFontFamily: null, titleFontFamily: null,
    statusBarFontFamily: null, useDarkMode: false, themeSyncMode: 'independent',
    themeScheduleMode: 'disabled', themeScheduleNightStartMinutes: 1320,
    themeScheduleNightEndMinutes: 420, isEnabledEyeProtectedMode: false,
    eyeProtectedModeIntensity: 20, turnPageType: 'simulationBessel',
    leftToRightPageTurn: false, boxDecorationBreakMode: 'clone',
    disableTapTurnPageAnimation: false, pinSidebar: false, sidebarWidth: 300.0,
    pinRightSidebar: false, rightSidebarWidth: 300.0, pinAppbar: false,
    autoPagerSpeed: 0.0002, statusItemTypeHeaderLeft: 'chapterName',
    statusItemTypeHeaderRight: 'time', statusItemTypeFooterLeft: 'time',
    statusItemTypeFooterRight: 'pageInChapter', statusItemTypeHeaderCenter: 'none',
    statusItemTypeFooterCenter: 'none', customTemplateHeaderLeft: '',
    customTemplateHeaderRight: '', customTemplateFooterLeft: '',
    customTemplateFooterRight: '', customTemplateHeaderCenter: '',
    customTemplateFooterCenter: '', statusBarFontSize: 12.0,
    headerStatusBarFontSize: null, footerStatusBarFontSize: null,
    annotationFontSize: -1.0, openccType: 'none', processType: 'chapterPage',
    pullUpExit: false, pullDownBookmark: true, singleHandMode: false,
    volumeTurnPageEnabled: false, noteDefaultStyle: 'wavy', noteDefaultColor: 'blue',
    desktopSelectMenuImmediately: true, scrollTapTurnPageEnabled: true,
    horizontalSwipePageTurnEnabled: true, horizontalSwipeBackgroundFollowPageTurn: false,
    desktopClickTurnPageEnabled: true, desktopLongPressOpenImageEnabled: false,
    useTopSafeArea: true, useBottomSafeArea: true, useLeftSafeArea: true,
    useRightSafeArea: true, enableCssStyle: true, enableCssBackground: true,
    enableCssBackgroundColor: true, enableCssFont: true, enableCssFontWeight: true,
    enableCssFontStyle: true, enableCssFontSize: true, enableTableFontSizeScale: true,
    cssParagraphSpacingMode: 'defaults', enableCssPadding: true,
    ignoreBlankParagraph: false, showFootnoteDefinition: false,
    cssLineHeightMode: 'defaults', enableCssFontColor: true,
    enableCssTextAlignIndent: true, enableCssVisualEffect: true,
    naturalScrolling: true, textJustificationMode: 'all', bottomAlignment: true,
    englishHyphenationMode: 'noHyphen', applePencilDoubleTapAction: 'nextPage',
    applePencilSqueezeAction: 'none', lineUnderlineStyle: 'dashed',
    lineUnderlineHeight: 0.5, lineUnderlineFullWidth: false, lineUnderlineOffset: 2.0,
    lineUnderlineOpacity: 40, lineUnderlineDashLength: 4, lineUnderlineExcludeTitle: false,
    showBatteryPercent: false, enableBionicReading: false,
    enableDarkModeImageInvert: false, darkModeImageOpacity: 1.0,
    translucentLayoutPageOpacity: 1.0, enableFloatLayout: true,
    cssBackgroundImageScaleMode: 'auto'
  };

  const FORMAT_META = {
    md3: {
      label: 'MD3',
      ext: '.zip',
      cardTitle: 'MD3 主题',
      packageLabel: 'MD3 原生包',
      note: '主题与排版分别为独立 ZIP'
    },
    archive: {
      label: 'Archive',
      ext: '.zip',
      cardTitle: 'Archive 主题',
      packageLabel: 'Archive 原生包',
      note: '主题为 appearance_kit.zip，排版为 readConfig.zip'
    },
    reeden: {
      label: 'Reeden',
      ext: '.red',
      cardTitle: 'Reeden 主题包',
      packageLabel: 'Reeden RED 包',
      note: '单个 .red 同时包含主题与排版'
    }
  };

  // ── DOM Refs ────────────────────────────────────────────────────
  const $  = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const themeToggleBtn     = $('themeToggleBtn');
  const themeIcon          = $('themeIcon');
  const themeLabel         = $('themeLabel');

  const workspace          = $('workspace');
  const mobileTabSwitcher  = $('mobileTabSwitcher');
  const panelLeft          = $('panelLeft');

  const dropZone           = $('dropZone');
  const fileInput          = $('fileInput');
  const isQQBrowser        = /QQ\/|MQQBrowser|QQBrowser/i.test(navigator.userAgent);
  document.documentElement.classList.toggle('is-qq-browser', isQQBrowser);
  const queueList          = $('queueList');
  const queueCount         = $('queueCount');
  
  const convertBtn         = $('convertBtn');
  const splitExportButtons = $('splitExportButtons');
  const exportUiBtn        = $('exportUiBtn');
  const exportReaderBtn    = $('exportReaderBtn');
  const exportFormatGroup  = $('exportFormatGroup');
  const archiveItemUi      = $('archiveItemUi');
  const archiveItemReader  = $('archiveItemReader');
  const archiveUiState     = $('archiveUiState');
  const archiveReaderState = $('archiveReaderState');
  const archiveSummary     = $('archiveSummary');
  const archiveLive        = $('archiveLive');
  const archiveExtBadge    = $('archiveExtBadge');
  const archiveCardTitleText = $('archiveCardTitleText');
  const archivePrimaryLabel= $('archivePrimaryLabel');
  const archivePrimarySub  = $('archivePrimarySub');
  const reedenPairPanel    = $('reedenPairPanel');
  const reedenUiSelect     = $('reedenUiSelect');
  const reedenReaderSelect = $('reedenReaderSelect');
  const reedenAddFilesBtn  = $('reedenAddFilesBtn');
  const reedenPairNote     = $('reedenPairNote');

  const themeNameInput     = $('themeNameInput');

  const mockupModeBtn      = $('mockupModeBtn');
  const mockupModeIcon     = $('mockupModeIcon');
  const mockupModeLabel    = $('mockupModeLabel');

  const phoneScreen        = $('phoneScreen');
  const phoneTopbar        = $('phoneTopbar');
  const phoneNavBar        = $('phoneNavBar');
  const phoneCard          = document.querySelector('#tabPreview .book-card');
  const previewTitle       = $('previewTitle');
  const galleryGrid        = $('galleryGrid');

  // Reader Screen Elements
  const readerScreen       = $('readerScreen');
  const readerBody         = $('readerBody');
  const readerBookName     = $('readerBookName');
  const readerTitleText    = $('readerTitleText');

  const navWrappers = {
    home:      $('navHome'),
    bookshelf: $('navBookshelf'),
    explore:   $('navExplore'),
    rss:       $('navRss'),
    my:        $('navMy')
  };

  // Set initial workspace state for mobile
  if (workspace) workspace.setAttribute('data-m-active', 'controls');
  if (panelLeft) panelLeft.dataset.target = state.exportFormat;

  // ── Mobile Main Tab Switcher ─────────────────────────────────────
  $$('.m-switcher-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.m-switcher-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mTab = btn.getAttribute('data-m-tab');
      state.mobileTab = mTab;
      if (workspace) workspace.setAttribute('data-m-active', mTab);
    });
  });

  // ── IndexedDB 10-Minute Persistent Caching ────────────────────────
  const DB_NAME = 'MorandiStudioDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'appCache';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  async function saveCacheState() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const itemsToCache = state.queue.map(item => ({
        id: item.id,
        name: item.name,
        rawType: item.rawType,
        customName: item.customName,
        fileBlob: item.file
      }));

      const cacheData = {
        id: 'current_session',
        timestamp: Date.now(),
        activeId: state.activeId,
        themeName: themeNameInput ? themeNameInput.value : '',
        exportFormat: state.exportFormat,
        reedenPair: state.reedenPair,
        items: itemsToCache
      };

      store.put(cacheData);
    } catch(e) {
      console.warn('[Cache Save Error]', e);
    }
  }

  async function loadCacheState() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current_session');

      req.onsuccess = async () => {
        const cache = req.result;
        if (!cache || !cache.timestamp) return;

        const age = Date.now() - cache.timestamp;
        if (age > CACHE_TTL_MS || !cache.items || !cache.items.length) {
          clearCacheState();
          state.queue = [];
          state.activeId = null;
          if (themeNameInput) themeNameInput.value = '';
          resetPreview();
          renderQueue();
          return;
        }

        state.queue = [];
        for (const cachedItem of cache.items) {
          if (!cachedItem.fileBlob) continue;
          const item = {
            id: cachedItem.id,
            file: cachedItem.fileBlob,
            name: cachedItem.name,
            rawType: cachedItem.rawType,
            customName: cachedItem.customName,
            hasUi: false,
            hasReader: false,
            parsedUi: null,
            parsedReader: null,
            status: 'parsing'
          };
          state.queue.push(item);
          try {
            await parseFile(item);
          } catch(err) {
            console.warn('[Cache Re-parse Failed]', item.name, err);
          }
        }

        if (cache.themeName && themeNameInput) themeNameInput.value = cache.themeName;
        if (cache.exportFormat) setExportFormat(cache.exportFormat, false);
        if (cache.reedenPair) {
          state.reedenPair = {
            uiId: cache.reedenPair.uiId || null,
            readerId: cache.reedenPair.readerId || null,
            activeId: cache.reedenPair.activeId || null
          };
        }
        state.activeId = cache.activeId || (state.queue[0] ? state.queue[0].id : null);

        renderQueue();
        if (state.activeId) selectItem(state.activeId);

        showCacheRestoredToast(Math.ceil((CACHE_TTL_MS - age) / 60000));
      };
    } catch(e) {
      console.warn('[Cache Load Error]', e);
    }
  }

  async function clearCacheState() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete('current_session');
    } catch(e){}
  }

  function showCacheRestoredToast(remainingMins) {
    const tipBox = $('importTipBox');
    if (tipBox) {
      tipBox.style.display = 'block';
      tipBox.innerHTML = `<i class="fa-solid fa-clock-rotate-left" style="color: var(--sage);"></i> <b>已自动恢复离开前的编辑状态</b><br>退出页面或切换应用自动保留（剩余约 ${remainingMins} 分钟有效缓存）。`;
    }
  }

  // Load cache on startup
  loadCacheState();

  // ── Helpers ─────────────────────────────────────────────────────

  function hexToArgbInt(hex) {
    if (typeof hex === 'number' && Number.isFinite(hex)) return hex | 0;
    if (!hex || typeof hex !== 'string') return 0;
    let h = hex.replace('#', '').trim();
    if (h.length === 3) h = 'FF' + h.split('').map(c => c + c).join('');
    else if (h.length === 4) h = h.split('').map(c => c + c).join('');
    else if (h.length === 6) h = 'FF' + h;
    if (h.length !== 8) return 0;
    let v = parseInt(h, 16);
    if (v > 0x7FFFFFFF) v -= 0x100000000;
    return v;
  }

  function argbIntToHex(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '';
    return '#' + (value >>> 0).toString(16).padStart(8, '0').toUpperCase();
  }

  function colorLuminance(value) {
    const hex = argbIntToHex(hexToArgbInt(value)).slice(1);
    const channels = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const linear = channels.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function contrastRatio(a, b) {
    const la = colorLuminance(a);
    const lb = colorLuminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function readableTextColor(rawValue, background, fallback) {
    const candidate = rawValue ? hexToArgbInt(rawValue) : null;
    if (candidate && contrastRatio(candidate, background) >= 3.0) return candidate;
    return hexToArgbInt(fallback);
  }


  function toArgbHex(value, fallback = '#FF000000') {
    if (typeof value === 'number' && Number.isFinite(value)) {
      const hex = argbIntToHex(value);
      return hex || fallback;
    }
    if (!value || typeof value !== 'string') return fallback;
    let h = value.trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length === 4) h = h.split('').map(c => c + c).join('');
    if (/^[0-9a-f]{6}$/i.test(h)) return ('#FF' + h).toUpperCase();
    if (/^[0-9a-f]{8}$/i.test(h)) return ('#' + h).toUpperCase();
    return fallback;
  }

  function toCssColor(value, fallback = '#8A9E8B') {
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value === 0) return fallback;
      return '#' + (value >>> 0).toString(16).padStart(8, '0').slice(2).toUpperCase();
    }
    if (!value || typeof value !== 'string') return fallback;
    let h = value.trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length === 4) h = h.split('').map(c => c + c).join('');
    if (/^[0-9a-f]{6}$/i.test(h)) return ('#' + h).toUpperCase();
    if (/^[0-9a-f]{8}$/i.test(h)) return ('#' + h.slice(2)).toUpperCase();
    return fallback;
  }

  function isRealColor(value) {
    if (typeof value === 'number') return value !== 0;
    return typeof value === 'string' && /^#?[0-9a-f]{6,8}$/i.test(value.trim());
  }

  function mixHex(a, b, ratio = 0.5) {
    const parse = hex => {
      const h = toCssColor(hex).replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    const [r1, g1, b1] = parse(a);
    const [r2, g2, b2] = parse(b);
    const mix = (x, y) => Math.round(x * (1 - ratio) + y * ratio);
    return '#' + [mix(r1, r2), mix(g1, g2), mix(b1, b2)].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function md5Bytes(bytes) {
    const len = bytes.length;
    const paddedLength = (((len + 8) >>> 6) + 1) << 6;
    const buffer = new ArrayBuffer(paddedLength);
    const padded = new Uint8Array(buffer);
    padded.set(bytes);
    padded[len] = 0x80;
    const view = new DataView(buffer);
    const bitLen = len * 8;
    view.setUint32(paddedLength - 8, bitLen >>> 0, true);
    view.setUint32(paddedLength - 4, Math.floor(bitLen / 0x100000000), true);
    const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
               5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
               4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
               6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    const K = [];
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    const M = new Int32Array(16);
    for (let off = 0; off < paddedLength; off += 64) {
      for (let i = 0; i < 16; i++) M[i] = view.getUint32(off + i * 4, true) | 0;
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        const tmp = D;
        D = C;
        C = B;
        const sum = (A + F + K[i] + M[g]) | 0;
        B = (B + ((sum << S[i]) | (sum >>> (32 - S[i])))) | 0;
        A = tmp;
      }
      a0 = (a0 + A) | 0;
      b0 = (b0 + B) | 0;
      c0 = (c0 + C) | 0;
      d0 = (d0 + D) | 0;
    }
    const out = new Uint8Array(16);
    const dv = new DataView(out.buffer);
    [a0, b0, c0, d0].forEach((v, i) => dv.setUint32(i * 4, v >>> 0, true));
    return Array.from(out).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function legadoParagraphIndent(value) {
    if (!value || value === 'defaults' || value === 'default' || value === 'defaults ') return '　　';
    if (value === 'double' || value === '2em' || value === '2') return '　　';
    if (value === 'none' || value === '0') return '';
    return String(value);
  }

  function nonNegative(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  async function blobMd5Hex(blob) {
    const buffer = await blob.arrayBuffer();
    return md5Bytes(new Uint8Array(buffer));
  }

  async function imageExtension(blob) {
    const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47) return 'png';
    if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) return 'webp';
    if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return 'gif';
    return 'jpg';
  }

  async function imageFileName(blob, prefix = 'bg') {
    const hash = (await blobMd5Hex(blob)).slice(0, 16);
    const ext = await imageExtension(blob);
    return `${prefix}_${hash}.${ext}`;
  }

  async function imageAverageBrightness(blob) {
    let bitmap;
    try { bitmap = await createImageBitmap(blob); } catch (e) { return 0; }
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0, 8, 8);
    if (bitmap.close) bitmap.close();
    const data = ctx.getImageData(0, 0, 8, 8).data;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    return total / (data.length / 4);
  }

  async function averageImageColor(blob) {
    try {
      const bitmap = await createImageBitmap(blob);
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      if (bitmap.close) bitmap.close();
      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 32) continue;
        pixels.push([data[i], data[i + 1], data[i + 2], data[i] + data[i + 1] + data[i + 2]]);
      }
      // Paper/background is the light cluster, not the average of artwork ink.
      pixels.sort((a, b) => b[3] - a[3]);
      const take = Math.max(1, Math.floor(pixels.length * 0.2));
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < take; i++) {
        r += pixels[i][0];
        g += pixels[i][1];
        b += pixels[i][2];
      }
      return '#' + [r / take, g / take, b / take]
        .map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
    } catch (err) {
      return null;
    }
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function randomHash() {
    return randomId().replace(/-/g, '').toUpperCase();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function typeLabel(item) {
    const parts = [];
    if (item.hasUi) parts.push('界面');
    if (item.hasReader) parts.push('排版');
    const label = parts.length ? parts.join('+') : '美化包';
    return `${item.rawType === 'red' ? 'Reeden' : 'Zip'} (${label})`;
  }

  // ── Export Format Switch ────────────────────────────────────────
  function setExportFormat(format, persist = true) {
    state.exportFormat = ['md3', 'archive', 'reeden'].includes(format) ? format : 'md3';
    if (exportFormatGroup) {
      exportFormatGroup.querySelectorAll('.format-chip').forEach(chip => {
        const active = chip.dataset.format === state.exportFormat;
        chip.classList.toggle('active', active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    if (panelLeft) panelLeft.dataset.target = state.exportFormat;
    updateExportPanel();
    if (persist) saveCacheState();
  }

  if (exportFormatGroup) {
    exportFormatGroup.querySelectorAll('.format-chip').forEach(chip => {
      chip.addEventListener('click', () => setExportFormat(chip.dataset.format));
    });
  }

  if (reedenUiSelect) {
    reedenUiSelect.addEventListener('change', () => {
      state.reedenPair.uiId = reedenUiSelect.value || null;
      updateExportPanel();
      saveCacheState();
    });
  }
  if (reedenReaderSelect) {
    reedenReaderSelect.addEventListener('change', () => {
      state.reedenPair.readerId = reedenReaderSelect.value || null;
      updateExportPanel();
      saveCacheState();
    });
  }
  if (reedenAddFilesBtn) {
    reedenAddFilesBtn.addEventListener('click', () => fileInput.click());
  }

  // ── App Day/Night Toggle ─────────────────────────────────────────
  themeToggleBtn.addEventListener('click', () => {
    state.appTheme = state.appTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.appTheme);
    themeToggleBtn.setAttribute('aria-pressed', state.appTheme === 'dark' ? 'true' : 'false');
    if (state.appTheme === 'dark') {
      themeIcon.className = 'fa-solid fa-moon';
      themeLabel.textContent = '夜间';
    } else {
      themeIcon.className = 'fa-solid fa-sun';
      themeLabel.textContent = '日间';
    }
  });

  // ── Mockup Day/Night Toggle ──────────────────────────────────────
  mockupModeBtn.addEventListener('click', () => {
    state.mockupMode = state.mockupMode === 'light' ? 'dark' : 'light';
    phoneScreen.setAttribute('data-mockup-mode', state.mockupMode);
    mockupModeBtn.setAttribute('aria-pressed', state.mockupMode === 'dark' ? 'true' : 'false');
    if (state.mockupMode === 'dark') {
      mockupModeIcon.className = 'fa-solid fa-moon';
      mockupModeLabel.textContent = '夜间视图';
    } else {
      mockupModeIcon.className = 'fa-solid fa-sun';
      mockupModeLabel.textContent = '日间视图';
    }

    const activeItem = state.queue.find(q => q.id === state.activeId);
    if (activeItem) applyPreview(activeItem);
  });

  // ── Tab Switcher inside Inspector ───────────────────────────────
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      state.activeTab = tab;

      $$('.tab-pane').forEach(p => p.style.display = 'none');
      const pane = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
      if (pane) pane.style.display = 'block';

      // Hide Phone Statusbar, TopBar & Bottom NavBar when viewing Reader Typesetting Preview tab
      const phoneStatusbar = $('phoneStatusbar');
      if (tab === 'reader') {
        if (phoneStatusbar) phoneStatusbar.style.display = 'none';
        phoneTopbar.style.display = 'none';
        phoneNavBar.style.display = 'none';
      } else {
        if (phoneStatusbar) phoneStatusbar.style.display = 'flex';
        phoneTopbar.style.display = 'flex';
        phoneNavBar.style.display = 'flex';
      }
    });
  });

  // ── File Drag & Drop ─────────────────────────────────────────────
  // Normal browsers tap the transparent input directly. QQ's WebView does not
  // reliably deliver that tap, so it uses a synchronous programmatic click.
  dropZone.addEventListener('click', e => {
    if (isQQBrowser && e.target !== fileInput) fileInput.click();
  });
  dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener('click', e => e.stopPropagation());
  const bindDrop = target => {
    target.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    target.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    target.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
  };
  bindDrop(dropZone);
  bindDrop(fileInput);
  fileInput.addEventListener('change', e => { if (e.target.files.length) handleFiles(e.target.files); });

  async function handleFiles(files) {
    if (!files || !files.length) return;
    const validFiles = Array.from(files);

    const newItems = [];
    for (let idx = 0; idx < validFiles.length; idx++) {
      const file = validFiles[idx];
      const ext = file.name.split('.').pop().toLowerCase();
      const item = {
        id: 'item_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        rawType: ['rgshare', 'rgtheme', 'rg'].includes(ext) ? 'rgshare' : (ext === 'red' ? 'red' : 'zip'),
        hasUi: false,
        hasReader: false,
        status: 'parsing',
        parsedUi: null,
        parsedReader: null
      };
      state.queue.push(item);
      newItems.push(item);
    }

    renderQueue();

    for (const item of newItems) {
      try {
        await parseFile(item);
        if (state.activeId === item.id) {
          applyPreview(item);
        }
      } catch (err) {
        console.error('[handleFiles parse error]', item.name, err);
        item.status = 'error';
      }
    }

    if (newItems.length > 0) {
      const activeItem = state.queue.find(q => q.id === state.activeId) || newItems.find(i => i.status === 'ready') || newItems[0];
      selectItem(activeItem.id);
    } else {
      renderQueue();
    }

    saveCacheState();
  }

  const clearAllBtn = $('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      state.queue = [];
      state.activeId = null;
      state.reedenPair = { uiId: null, readerId: null, activeId: null };
      if (themeNameInput) themeNameInput.value = '';
      resetPreview();
      clearCacheState();
      renderQueue();
    });
  }

  // ── Queue UI Rendering ────────────────────────────────────────────
  function renderQueue() {
    queueCount.textContent = `${state.queue.length} 个文件`;
    if (clearAllBtn) {
      clearAllBtn.style.display = state.queue.length > 0 ? 'inline-flex' : 'none';
    }
    queueList.innerHTML = '';

    state.queue.forEach(item => {
      const isSelected = state.activeId === item.id;
      const el = document.createElement('div');
      el.className = 'queue-item' + (isSelected ? ' active' : '');
      
      const displayName = item.customName || (item.parsedUi ? item.parsedUi.name : item.parsedReader ? item.parsedReader.name : item.name);

      el.innerHTML = `
        <div class="qi-icon"><i class="fa-solid ${item.hasUi && item.hasReader ? 'fa-layer-group' : item.hasReader ? 'fa-book-open-reader' : 'fa-palette'}"></i></div>
        <div class="qi-info">
          <div class="qi-name" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</div>
          <div class="qi-meta">${escapeHtml(typeLabel(item))}</div>
        </div>
        <span class="qi-status status-${item.status}">
          ${item.status === 'ready' ? '就绪' : item.status === 'done' ? '已导出' : item.status === 'error' ? '失败' : '转换中'}
        </span>
        <button class="qi-remove" title="移除"><i class="fa-solid fa-xmark"></i></button>
      `;
      el.addEventListener('click', e => {
        if (!e.target.closest('.qi-remove')) selectItem(item.id);
      });
      el.querySelector('.qi-remove').addEventListener('click', e => {
        e.stopPropagation();
        state.queue = state.queue.filter(q => q.id !== item.id);
        if (state.activeId === item.id) {
          state.activeId = state.queue.length ? state.queue[0].id : null;
          if (state.activeId) {
            selectItem(state.activeId);
          } else {
            resetPreview();
          }
        }
        renderQueue();
      });
      queueList.appendChild(el);
    });

    updateExportPanel();

    if (state.queue.length === 0) {
      clearCacheState();
      resetPreview();
    } else {
      saveCacheState();
    }
  }

  function pairLabel(item) {
    if (!item) return '';
    const name = item.parsedUi?.name || item.parsedReader?.name || item.name;
    return `${name} · ${(item.sourceFormat || 'zip').toUpperCase()}`;
  }

  function getReedenPair(activeItem) {
    const ui = state.queue.find(q => q.id === state.reedenPair.uiId && q.hasUi);
    const reader = state.queue.find(q => q.id === state.reedenPair.readerId && q.hasReader);
    if (ui || reader) return { ui: ui || null, reader: reader || null };
    return resolveSourcePair(activeItem);
  }

  function updateReedenPairOptions(activeItem) {
    if (!reedenUiSelect || !reedenReaderSelect) return getReedenPair(activeItem);
    const uiItems = state.queue.filter(q => q.hasUi);
    const readerItems = state.queue.filter(q => q.hasReader);
    const auto = resolveSourcePair(activeItem);
    const sameActive = state.reedenPair.activeId === (activeItem ? activeItem.id : null);
    const keep = (current, items, fallback) => {
      if (sameActive && current && items.some(q => q.id === current)) return current;
      if (fallback && items.some(q => q.id === fallback.id)) return fallback.id;
      return items[0]?.id || '';
    };
    const uiId = keep(state.reedenPair.uiId, uiItems, auto.ui);
    const readerId = keep(state.reedenPair.readerId, readerItems, auto.reader);
    state.reedenPair = {
      uiId: uiId || null,
      readerId: readerId || null,
      activeId: activeItem ? activeItem.id : null
    };

    const fill = (select, items, selectedId, emptyText, role) => {
      select.innerHTML = '';
      if (!items.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = emptyText;
        select.appendChild(opt);
        select.disabled = true;
        return;
      }
      select.disabled = false;
      items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${pairLabel(item)} · ${role === 'ui' ? '主题' : '排版'}`;
        opt.selected = item.id === selectedId;
        select.appendChild(opt);
      });
      select.value = selectedId || items[0].id;
    };
    fill(reedenUiSelect, uiItems, uiId, '队列中没有主题包', 'ui');
    fill(reedenReaderSelect, readerItems, readerId, '队列中没有排版包', 'reader');

    const ui = state.queue.find(q => q.id === state.reedenPair.uiId) || null;
    const reader = state.queue.find(q => q.id === state.reedenPair.readerId) || null;
    if (reedenPairNote) {
      reedenPairNote.classList.toggle('is-ready', !!ui && !!reader);
      reedenPairNote.classList.toggle('is-missing', !ui || !reader);
      if (ui && reader) {
        reedenPairNote.textContent = `将合并：${pairLabel(ui)} + ${pairLabel(reader)}`;
      } else if (!ui && !reader) {
        reedenPairNote.textContent = '请先把主题包和排版包一起拖入上方，再分别选择。';
      } else if (!ui) {
        reedenPairNote.textContent = '还缺主题包：请导入 Arc / MD3 主题 ZIP。';
      } else {
        reedenPairNote.textContent = '还缺排版包：请导入 Arc / MD3 排版 ZIP。';
      }
    }
    return { ui, reader };
  }

  // ── Export Panel State ───────────────────────────────────────────
  function updateExportPanel() {
    const activeItem = state.queue.find(q => q.id === state.activeId);
    if (panelLeft) panelLeft.classList.toggle('has-files', !!activeItem);
    updateReedenPairOptions(activeItem);
    const pair = state.exportFormat === 'reeden' ? getReedenPair(activeItem) : resolveSourcePair(activeItem);
    const hasUi = !!pair.ui;
    const hasReader = !!pair.reader;
    const moduleCount = Number(hasUi) + Number(hasReader);
    const format = FORMAT_META[state.exportFormat] ? state.exportFormat : 'md3';
    const meta = FORMAT_META[format];
    const ext = format === 'reeden' ? '.red' : '.zip';
    if (panelLeft) panelLeft.dataset.target = format;

    if (archiveExtBadge) {
      archiveExtBadge.textContent = ext;
      archiveExtBadge.classList.toggle('is-md3', format === 'md3');
    }
    if (archiveCardTitleText) {
      archiveCardTitleText.textContent = meta.cardTitle;
    }

    if (archiveItemUi) {
      archiveItemUi.classList.toggle('is-unavailable', !hasUi);
      archiveItemUi.classList.toggle('is-ready', hasUi);
    }
    if (archiveItemReader) {
      archiveItemReader.classList.toggle('is-unavailable', !hasReader);
      archiveItemReader.classList.toggle('is-ready', hasReader);
    }
    if (exportUiBtn) exportUiBtn.disabled = !hasUi || exportUiBtn.classList.contains('is-loading');
    if (exportReaderBtn) exportReaderBtn.disabled = !hasReader || exportReaderBtn.classList.contains('is-loading');

    if (archiveUiState) {
      archiveUiState.textContent = hasUi
        ? (pair.ui === activeItem ? '已识别 · 可单独导出' : `已配对 · ${pair.ui.name}`)
        : (activeItem ? '队列中未找到主题模块' : '等待导入');
    }
    if (archiveReaderState) {
      archiveReaderState.textContent = hasReader
        ? (pair.reader === activeItem ? '已识别 · 可单独导出' : `已配对 · ${pair.reader.name}`)
        : (activeItem ? '队列中未找到排版模块' : '等待导入');
    }

    const reedenReady = format !== 'reeden' || (hasUi && hasReader);

    if (archiveLive) {
      archiveLive.textContent = !activeItem ? '待导入' : format === 'reeden'
        ? (hasUi && hasReader ? '可打包' : '缺文件')
        : (moduleCount ? '可转换' : '未识别');
      archiveLive.classList.toggle('is-ready', !!activeItem && (format === 'reeden' ? reedenReady : moduleCount > 0));
      archiveLive.classList.toggle('is-empty', !!activeItem && (format === 'reeden' ? !reedenReady : moduleCount === 0));
    }

    if (archiveSummary) {
      if (!activeItem) {
        archiveSummary.textContent = '导入主题后，自动识别可转换模块';
      } else if (format === 'reeden') {
        archiveSummary.textContent = hasUi && hasReader
          ? '已选择主题 + 排版，将合并为 1 个 .red'
          : '转 Red 必须同时选择主题来源和排版来源';
      } else if (!moduleCount) {
        archiveSummary.textContent = '未识别到可转换的美化模块';
      } else {
        archiveSummary.textContent = `将输出 ${moduleCount} 个 ${meta.label} 原生 ZIP · ${[hasUi ? '主题' : '', hasReader ? '排版' : ''].filter(Boolean).join(' + ')}`;
      }
    }

    if (convertBtn) {
      convertBtn.disabled = !activeItem || moduleCount === 0 || !reedenReady || convertBtn.classList.contains('is-loading');
    }

    let label = `导出 ${meta.label} 主题 + 排版`;
    let sub = format === 'reeden' ? '单个 .red 文件 · 主题与排版一起导入' : '2 个 ZIP · 主题与排版分别导入';
    if (format === 'reeden') {
      label = reedenReady ? '打包为 Reeden .red' : '请选择主题与排版来源';
      sub = reedenReady ? '单文件 .red · 含主题 + 排版' : '转 Red 需要两个文件';
    } else if (moduleCount === 1) {
      label = hasUi ? `导出 ${meta.label} 主题` : `导出 ${meta.label} 排版`;
      sub = hasUi ? `1 个 ZIP · ${meta.label} 主题包` : `1 个 ZIP · ${meta.label} 排版包`;
    }
    if (archivePrimaryLabel) archivePrimaryLabel.textContent = label;
    if (archivePrimarySub) archivePrimarySub.textContent = sub;

    const batchExportOptions = $('batchExportOptions');
    const batchExportBtn = $('batchExportBtn');
    const batchExportLabel = $('batchExportLabel');
    if (batchExportOptions && batchExportBtn && batchExportLabel) {
      if (state.queue.length > 1) {
        batchExportOptions.style.display = 'block';
        batchExportBtn.style.display = 'block';
        const mode = state.batchMode || 'full';
        const modeText = mode === 'ui' ? '仅主题' : mode === 'reader' ? '仅排版' : '全套';
        const targetItems = state.queue.filter(q => {
          if (mode === 'ui') return q.hasUi;
          if (mode === 'reader') return q.hasReader;
          return q.hasUi || q.hasReader;
        });
        batchExportLabel.textContent = `批量导出 ${meta.label} (${modeText} · ${targetItems.length} 个)`;
      } else {
        batchExportOptions.style.display = 'none';
        batchExportBtn.style.display = 'none';
      }
    }
  }

  function selectItem(id) {
    // Save custom theme name for previously active item before switching
    if (state.activeId) {
      const prev = state.queue.find(q => q.id === state.activeId);
      if (prev && themeNameInput) {
        prev.customName = themeNameInput.value.trim();
      }
    }

    state.activeId = id;
    const item = state.queue.find(q => q.id === id);
    if (item && themeNameInput) {
      themeNameInput.value = item.customName !== undefined ? item.customName : (item.parsedUi ? item.parsedUi.name : item.parsedReader ? item.parsedReader.name : item.name);
    }

    renderQueue();
    if (item) applyPreview(item);
    saveCacheState();
  }

  // ── Parse Theme Files ─────────────────────────────────────────────
  async function parseFile(item) {
    try {
      // Reeden containers: RED\x10 = v2 binary stream, RED\x04 + ZIP = v4 archive.
      const headerBuffer = await item.file.slice(0, 8).arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);
      const isRedV2 = headerBytes[0] === 0x52 && headerBytes[1] === 0x45 && headerBytes[2] === 0x44 && headerBytes[3] === 0x10;
      const isRedV4 = headerBytes[0] === 0x52 && headerBytes[1] === 0x45 && headerBytes[2] === 0x44 && headerBytes[3] === 0x04;

      if (isRedV2) {
        await parseRedV2(item);
        return;
      }

      const zipSource = isRedV4 ? item.file.slice(4) : item.file;
      item.container = isRedV4 ? 'red-v4' : 'zip';
      const zip = await JSZip.loadAsync(zipSource);
      const names = Object.keys(zip.files);

      // Check if file is .rgshare (Reeden / Reader Go Share Bundle v2)
      if (names.includes('meta.json') && names.some(n => n.includes('reader_theme'))) {
        await extractRgShare(zip, item);
        return;
      }

      // Check App UI components
      if (names.includes('theme.json')) {
        item.hasUi = true;
        item.sourceFormat = 'reeden';
        const meta = JSON.parse(await zip.file('theme.json').async('text'));
        item.parsedUi = await extractRedUi(zip, meta);
      } else if (names.includes('appearance_kit.json')) {
        item.hasUi = true;
        item.sourceFormat = 'archive';
        const meta = JSON.parse(await zip.file('appearance_kit.json').async('text'));
        item.parsedUi = await extractArcUi(zip, meta);
      } else if (names.includes('manifest.json')) {
        item.hasUi = true;
        item.sourceFormat = 'md3';
        const meta = JSON.parse(await zip.file('manifest.json').async('text'));
        item.parsedUi = await extractMd3Ui(zip, meta, item);
      }

      // Check Reader Typesetting components
      const schemaFile = names.find(n => n.endsWith('schema.json') && n.includes('reader_schema'));
      if (schemaFile) {
        item.hasReader = true;
        if (!item.sourceFormat) item.sourceFormat = 'reeden';
        const schemaMeta = JSON.parse(await zip.file(schemaFile).async('text'));
        item.parsedReader = await extractRedReader(zip, schemaMeta);
      } else if (names.includes('readConfig.json')) {
        item.hasReader = true;
        const readCfg = JSON.parse(await zip.file('readConfig.json').async('text'));
        if (!item.sourceFormat) {
          item.sourceFormat = (readCfg.underlineMode !== undefined || readCfg.paperEffect !== undefined || readCfg.tipColor !== undefined)
            ? 'archive'
            : 'md3';
        }
        item.parsedReader = await extractZipReader(zip, readCfg);
      }

      item.status = (item.hasUi || item.hasReader) ? 'ready' : 'error';
      renderQueue();
    } catch (err) {
      console.warn('[JSZip parse failed, trying RED v2 fallback]', err);
      try {
        await parseRedV2(item);
      } catch (fallbackErr) {
        console.error('[RED v2 fallback failed]', fallbackErr);
        item.status = 'error';
        renderQueue();
      }
    }
  }

  // Fallback parser for Reeden v2 RED\x10 binary container files
  async function parseRedV2Legacy(item) {
    const arrayBuffer = await item.file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    // 1. Parse JSON schemas using robust brace matching
    const schemas = [];
    let pos = 0;
    while (true) {
      const idx = text.indexOf('{"name":', pos);
      if (idx === -1) break;
      let braceCount = 0;
      let inString = false;
      let escape = false;
      let endIdx = -1;
      for (let i = idx; i < Math.min(idx + 100000, text.length); i++) {
        const ch = text[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (!inString) {
          if (ch === '{') braceCount++;
          else if (ch === '}') {
            braceCount--;
            if (braceCount === 0) { endIdx = i + 1; break; }
          }
        }
      }
      if (endIdx !== -1) {
        try {
          const jsonStr = text.substring(idx, endIdx);
          schemas.push(JSON.parse(jsonStr));
          pos = endIdx;
        } catch(e) { pos = idx + 8; }
      } else {
        pos = idx + 8;
      }
    }

    let themeMeta = null;
    let readerMeta = null;
    schemas.forEach(s => {
      if (s && typeof s === 'object') {
        if (s.light && typeof s.light === 'object' && s.light.primaryColor) {
          themeMeta = s;
        } else if (s.backgroundColor && s.textColor && s.layoutConfig) {
          readerMeta = s;
        }
      }
    });

    // 2. Scan for JPEG images
    const jpegs = [];
    for (let i = 0; i < bytes.length - 3; i++) {
      if (bytes[i] === 0xFF && bytes[i+1] === 0xD8 && bytes[i+2] === 0xFF) {
        let end = -1;
        for (let j = i + 2; j < Math.min(i + 5000000, bytes.length - 1); j++) {
          if (bytes[j] === 0xFF && bytes[j+1] === 0xD9) { end = j + 2; break; }
        }
        if (end !== -1 && (end - i) > 2000) {
          const imgBytes = bytes.subarray(i, end);
          const blob = new Blob([imgBytes], { type: 'image/jpeg' });
          jpegs.push({ blob, url: URL.createObjectURL(blob) });
          i = end - 1;
        }
      }
    }

    // 3. Scan for PNG images
    const pngs = [];
    for (let i = 0; i < bytes.length - 8; i++) {
      if (bytes[i] === 0x89 && bytes[i+1] === 0x50 && bytes[i+2] === 0x4E && bytes[i+3] === 0x47) {
        let end = -1;
        for (let j = i + 8; j < Math.min(i + 5000000, bytes.length - 4); j++) {
          if (bytes[j] === 0x49 && bytes[j+1] === 0x45 && bytes[j+2] === 0x4E && bytes[j+3] === 0x48) {
            end = j + 8;
            break;
          }
        }
        if (end !== -1 && (end - i) > 200) {
          const imgBytes = bytes.subarray(i, end);
          const blob = new Blob([imgBytes], { type: 'image/png' });
          pngs.push({ blob, url: URL.createObjectURL(blob) });
          i = end - 1;
        }
      }
    }

    const themeName = (themeMeta ? themeMeta.name : item.name.replace(/\.red$/i, '')).replace(/[\r\n\t]/g, '').trim();
    const light = themeMeta ? (themeMeta.light || {}) : {};
    const dark  = themeMeta ? (themeMeta.dark || {})  : {};
    const uiData = newParsedUi(themeName, 'red', light.primaryColor || '#FF8909', dark.primaryColor, light.cardColor, dark.cardColor);

    if (jpegs.length > 0) {
      uiData.bgBlob = jpegs[0].blob;
      uiData.bgBlobUrl = jpegs[0].url;
    }

    const navKeys = ['home', 'bookshelf', 'explore', 'rss', 'my'];
    pngs.slice(0, 5).forEach((p, idx) => {
      if (idx < navKeys.length) {
        uiData.navIconsBlobs[navKeys[idx]] = { blob: p.blob, url: p.url };
      }
    });

    jpegs.slice(1, 10).forEach(j => {
      uiData.coversBlobs.push({ blob: j.blob, url: j.url });
    });

    item.hasUi = true;
    item.parsedUi = uiData;

    let layoutCfg = {};
    if (readerMeta && readerMeta.layoutConfig) {
      if (typeof readerMeta.layoutConfig === 'string') {
        try { layoutCfg = JSON.parse(readerMeta.layoutConfig); } catch(e){}
      } else {
        layoutCfg = readerMeta.layoutConfig;
      }
    }

    // 4. Scan for TTF / OTF fonts in RED\x10 binary container
    const fontExtraFiles = {};
    let fontIndex = 0;
    for (let i = 0; i < bytes.length - 12; i++) {
      const isTtf = (bytes[i] === 0x00 && bytes[i+1] === 0x01 && bytes[i+2] === 0x00 && bytes[i+3] === 0x00);
      const isOtf = (bytes[i] === 0x4F && bytes[i+1] === 0x54 && bytes[i+2] === 0x54 && bytes[i+3] === 0x4F);
      if (isTtf || isOtf) {
        const numTables = (bytes[i+4] << 8) | bytes[i+5];
        if (numTables > 0 && numTables < 100) {
          let maxOffset = 0;
          let validTables = true;
          for (let t = 0; t < numTables; t++) {
            const tableEntry = i + 12 + t * 16;
            if (tableEntry + 16 > bytes.length) { validTables = false; break; }
            const offset = (bytes[tableEntry+8] << 24) | (bytes[tableEntry+9] << 16) | (bytes[tableEntry+10] << 8) | bytes[tableEntry+11];
            const length = (bytes[tableEntry+12] << 24) | (bytes[tableEntry+13] << 16) | (bytes[tableEntry+14] << 8) | bytes[tableEntry+15];
            const tableEnd = offset + length;
            if (tableEnd > maxOffset) maxOffset = tableEnd;
          }
          if (validTables && maxOffset > 1000 && maxOffset < 50000000) {
            const fontBytes = bytes.subarray(i, Math.min(i + maxOffset + 1024, bytes.length));
            const ext = isOtf ? 'otf' : 'ttf';
            const fn = fontIndex === 0 ? `custom_font.${ext}` : `custom_font_${fontIndex}.${ext}`;
            const fontBlob = new Blob([fontBytes], { type: isOtf ? 'font/otf' : 'font/ttf' });
            fontExtraFiles[fn] = fontBlob;
            if (!uiData.fontBlob) uiData.fontBlob = fontBlob;
            fontIndex++;
            i += Math.min(maxOffset, fontBytes.length) - 1;
          }
        }
      }
    }

    const readerData = {
      name: readerMeta ? readerMeta.name : themeName,
      textColor: readerMeta ? readerMeta.textColor : '#3E3D3B',
      backgroundColor: readerMeta ? readerMeta.backgroundColor : '#F4F1EC',
      bgBlob: jpegs.length > 1 ? jpegs[1].blob : (jpegs.length > 0 ? jpegs[0].blob : null),
      bgBlobUrl: jpegs.length > 1 ? jpegs[1].url : (jpegs.length > 0 ? jpegs[0].url : null),
      layoutConfig: layoutCfg,
      extraFiles: fontExtraFiles
    };

    item.hasReader = true;
    item.sourceFormat = 'reeden';
    item.parsedReader = readerData;
    item.status = 'ready';
    renderQueue();
  }

  // RED\x10 v2: header + encrypted manifest + plaintext assets and schemas.
  // Assets are identified by the MD5 hashes stored in theme.json / schema.json.
  async function parseRedV2(item) {
    const arrayBuffer = await item.file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    const schemas = [];
    let pos = 0;
    while (true) {
      const idx = text.indexOf('{"name":', pos);
      if (idx === -1) break;
      let braceCount = 0;
      let inString = false;
      let escape = false;
      let endIdx = -1;
      for (let i = idx; i < Math.min(idx + 5000000, text.length); i++) {
        const ch = text[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') braceCount++;
        else if (ch === '}') {
          braceCount--;
          if (braceCount === 0) { endIdx = i + 1; break; }
        }
      }
      if (endIdx !== -1) {
        try {
          schemas.push(JSON.parse(text.substring(idx, endIdx)));
          pos = endIdx;
        } catch (e) {
          pos = idx + 8;
        }
      } else {
        pos = idx + 8;
      }
    }

    // Some RED v2 schemas are large and contain deeply escaped CSS, which can
    // break JSON.parse even when the braces balance. Recover their core fields
    // directly from the raw text so colors do not fall back to gray defaults.
    const looseString = (slice, key) => {
      const marker = `"${key}":"`;
      const p = slice.indexOf(marker);
      if (p < 0) return null;
      let i = p + marker.length;
      let out = '';
      while (i < slice.length) {
        const ch = slice[i];
        if (ch === '\\') { out += ch + (slice[i + 1] || ''); i += 2; continue; }
        if (ch === '"') break;
        out += ch;
        i++;
      }
      try { return JSON.parse(`"${out}"`); } catch (e) { return out; }
    };
    const looseReaderSchemas = [];
    let looseCursor = 0;
    while ((looseCursor = text.indexOf('"backgroundImageUrl"', looseCursor)) !== -1) {
      const start = text.lastIndexOf('{"name"', looseCursor);
      if (start >= 0) {
        const slice = text.slice(start, Math.min(start + 5000000, text.length));
        const bg = looseString(slice, 'backgroundImageUrl');
        const textColor = looseString(slice, 'textColor');
        const layoutRaw = looseString(slice, 'layoutConfig');
        if (bg && textColor && layoutRaw) {
          let layout = null;
          try { layout = JSON.parse(layoutRaw); } catch (e) {}
          if (layout && typeof layout === 'object' && !looseReaderSchemas.some(s => s.backgroundImageUrl === bg)) {
            looseReaderSchemas.push({
              name: looseString(slice, 'name') || '',
              backgroundColor: looseString(slice, 'backgroundColor'),
              textColor,
              primaryColor: looseString(slice, 'primaryColor'),
              backgroundImageUrl: bg,
              themeMode: looseString(slice, 'themeMode') || 'common',
              layoutConfig: layout
            });
          }
        }
      }
      looseCursor += 20;
    }

    let themeMeta = null;
    const readerSchemas = [...looseReaderSchemas];
    for (const s of schemas) {
      if (!s || typeof s !== 'object') continue;
      if (s.light && typeof s.light === 'object' && s.light.primaryColor) {
        themeMeta = s;
      } else if (s.layoutConfig && s.backgroundImageUrl && s.textColor) {
        if (!readerSchemas.some(existing => existing.backgroundImageUrl === s.backgroundImageUrl)) {
          readerSchemas.push(s);
        }
      }
    }

    const isLightText = value => {
      const css = toCssColor(value, '#000000').replace('#', '');
      const r = parseInt(css.slice(0, 2), 16) || 0;
      const g = parseInt(css.slice(2, 4), 16) || 0;
      const b = parseInt(css.slice(4, 6), 16) || 0;
      return (r * 299 + g * 587 + b * 114) / 1000 > 140;
    };
    const lightSchema = readerSchemas.find(s => !isLightText(s.textColor)) || readerSchemas[0] || {};
    const darkSchema = readerSchemas.find(s => s !== lightSchema && isLightText(s.textColor)) || readerSchemas.find(s => s !== lightSchema) || {};

    const parseLayoutConfig = schema => {
      if (!schema || !schema.layoutConfig) return {};
      if (typeof schema.layoutConfig === 'object') return schema.layoutConfig;
      try { return JSON.parse(schema.layoutConfig); } catch (e) { return {}; }
    };

    const themeName = (themeMeta ? themeMeta.name : item.name.replace(/\.red$/i, '')).replace(/[\r\n\t]/g, '').trim();
    const light = themeMeta ? (themeMeta.light || {}) : {};
    const dark = themeMeta ? (themeMeta.dark || {}) : {};
    const uiData = newParsedUi(themeName, 'reeden', light.primaryColor, dark.primaryColor, light.cardColor, dark.cardColor);
    uiData.raw.reeden = { theme: themeMeta, readerSchemas };
    uiData.backgroundColor = toCssColor(light.backgroundColor, uiData.backgroundColor);
    uiData.backgroundColorDark = toCssColor(dark.backgroundColor, uiData.backgroundColorDark);
    uiData.foregroundColor = toCssColor(light.foregroundColor, uiData.foregroundColor);
    uiData.foregroundColorDark = toCssColor(dark.foregroundColor, uiData.foregroundColorDark);
    uiData.mutedColor = toCssColor(light.mutedForegroundColor, uiData.mutedColor);
    uiData.mutedColorDark = toCssColor(dark.mutedForegroundColor, uiData.mutedColorDark);
    uiData.borderColor = toCssColor(light.borderColor, uiData.primaryColor);
    uiData.borderColorDark = toCssColor(dark.borderColor, uiData.primaryColorDark);
    uiData.accentColor = toCssColor(light.accentColor, uiData.primaryColor);
    uiData.accentColorDark = toCssColor(dark.accentColor, uiData.primaryColorDark);
    uiData.tabColor = toCssColor(light.tabBackgroundColor, uiData.cardColor);
    uiData.tabColorDark = toCssColor(dark.tabBackgroundColor, uiData.cardColorDark);
    uiData.shelfColor = toCssColor(light.shelfColor, uiData.primaryColor);
    uiData.shelfColorDark = toCssColor(dark.shelfColor, uiData.primaryColorDark);

    const images = [];
    const addImage = async (start, end, mime, type) => {
      const imageBytes = bytes.subarray(start, end);
      const blob = new Blob([imageBytes], { type: mime });
      let dims = null;
      try {
        const bitmap = await createImageBitmap(blob);
        dims = { w: bitmap.width, h: bitmap.height };
        if (bitmap.close) bitmap.close();
      } catch (e) {
        return;
      }
      images.push({
        blob,
        url: URL.createObjectURL(blob),
        md5: md5Bytes(imageBytes),
        dims,
        offset: start,
        type
      });
    };

    for (let i = 0; i < bytes.length - 3; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xD8 && bytes[i + 2] === 0xFF) {
        let end = -1;
        for (let j = i + 2; j < Math.min(i + 7000000, bytes.length - 1); j++) {
          if (bytes[j] === 0xFF && bytes[j + 1] === 0xD9) { end = j + 2; break; }
        }
        if (end !== -1 && end - i > 2000) {
          await addImage(i, end, 'image/jpeg', 'jpeg');
          i = end - 1;
        }
      }
    }

    for (let i = 0; i < bytes.length - 8; i++) {
      if (bytes[i] === 0x89 && bytes[i + 1] === 0x50 && bytes[i + 2] === 0x4E && bytes[i + 3] === 0x47) {
        let end = -1;
        for (let j = i + 8; j < Math.min(i + 7000000, bytes.length - 4); j++) {
          if (bytes[j] === 0x49 && bytes[j + 1] === 0x45 && bytes[j + 2] === 0x4E && bytes[j + 3] === 0x44) {
            end = j + 8;
            break;
          }
        }
        if (end !== -1 && end - i > 200) {
          await addImage(i, end, 'image/png', 'png');
          i = end - 1;
        }
      }
    }

    const jpegs = images.filter(img => img.type === 'jpeg');
    const pngs = images.filter(img => img.type === 'png');
    const hashOf = value => String(value || '').toLowerCase();
    const findByHash = (list, hash) => hash ? list.find(img => img.md5 === hash) : null;
    const nineWidth = fit => {
      const match = /nineSlice:\s*\d+\s*,\s*\d+\s*,\s*(\d+)/.exec(String(fit || ''));
      return match ? parseInt(match[1], 10) : 0;
    };

    let readerLightImg = findByHash(images, hashOf(lightSchema.backgroundImageUrl));
    let readerDarkImg = findByHash(images, hashOf(darkSchema.backgroundImageUrl));
    const portrait = images.filter(img => img.dims.h > img.dims.w * 1.3);
    if (!readerLightImg) {
      readerLightImg = portrait.find(img => img !== readerDarkImg) || portrait[0] || null;
    }
    if (!readerDarkImg && darkSchema && darkSchema.backgroundImageUrl) {
      readerDarkImg = portrait.find(img => img !== readerLightImg) || readerLightImg;
    }

    let uiLightImg = findByHash(images, hashOf(light.backgroundImage));
    let uiDarkImg = findByHash(images, hashOf(dark.backgroundImage));
    if (!uiLightImg || (!uiDarkImg && dark.backgroundImage)) {
      const width = nineWidth(light.backgroundImageFit) || nineWidth(dark.backgroundImageFit);
      let candidates = images.filter(img => width
        && img.dims.h > img.dims.w
        && Math.abs(img.dims.w - width) <= 2
        && img !== readerLightImg
        && img !== readerDarkImg);
      if (candidates.length > 1) {
        const scored = [];
        for (const img of candidates) scored.push({ img, brightness: await imageAverageBrightness(img.blob) });
        scored.sort((a, b) => b.brightness - a.brightness);
        candidates = scored.map(item => item.img);
      }
      if (!uiLightImg && candidates.length) uiLightImg = candidates[0];
      if (!uiDarkImg && dark.backgroundImage) {
        const darkChoice = candidates.find(img => img !== uiLightImg);
        uiDarkImg = darkChoice || uiLightImg;
      }
    }

    const readerBackgroundImages = new Set([readerLightImg, readerDarkImg].filter(Boolean).map(img => img.md5));
    const covers = images
      .filter(img => !readerBackgroundImages.has(img.md5)
        && img.dims.w >= 300
        && img.dims.h > img.dims.w * 1.2
        && img.dims.h <= img.dims.w * 1.8)
      .sort((a, b) => a.offset - b.offset)
      .slice(0, 12);
    const navIcons = pngs
      .filter(img => !covers.includes(img) && img.dims.w >= 128 && img.dims.w <= 300 && img.dims.h >= 100 && img.dims.h <= 300)
      .sort((a, b) => a.offset - b.offset);
    const navKeys = ['home', 'bookshelf', 'explore', 'rss', 'my'];
    navIcons.slice(0, navKeys.length).forEach((img, index) => {
      if (index < navKeys.length) {
        uiData.navIconsBlobs[navKeys[index]] = { blob: img.blob, url: img.url };
      }
    });
    uiData.coversBlobs = covers.map(img => ({ blob: img.blob, url: img.url }));
    const carouselHashes = (light.bookshelfCarouselImageUrls || []).map(hashOf);
    uiData.carouselBlobs = jpegs
      .filter(img => carouselHashes.includes(img.md5))
      .map(img => ({ blob: img.blob, url: img.url }));

    if (uiLightImg) {
      uiData.bgBlob = uiLightImg.blob;
      uiData.bgBlobUrl = uiLightImg.url;
    }
    if (uiDarkImg) {
      uiData.bgDarkBlob = uiDarkImg.blob;
      uiData.bgDarkBlobUrl = uiDarkImg.url;
    }

    const fontExtraFiles = {};
    let fontIndex = 0;
    for (let i = 0; i < bytes.length - 12; i++) {
      const isTtf = (bytes[i] === 0x00 && bytes[i + 1] === 0x01 && bytes[i + 2] === 0x00 && bytes[i + 3] === 0x00);
      const isOtf = (bytes[i] === 0x4F && bytes[i + 1] === 0x54 && bytes[i + 2] === 0x54 && bytes[i + 3] === 0x4F);
      if (!isTtf && !isOtf) continue;
      const numTables = (bytes[i + 4] << 8) | bytes[i + 5];
      if (!(numTables > 0 && numTables < 100)) continue;
      let maxOffset = 0;
      let validTables = true;
      const tableTags = [];
      for (let t = 0; t < numTables; t++) {
        const tableEntry = i + 12 + t * 16;
        if (tableEntry + 16 > bytes.length) { validTables = false; break; }
        const tag = String.fromCharCode(bytes[tableEntry], bytes[tableEntry + 1], bytes[tableEntry + 2], bytes[tableEntry + 3]);
        if (!/^[\x20-\x7E]{4}$/.test(tag)) { validTables = false; break; }
        tableTags.push(tag);
        const offset = (bytes[tableEntry + 8] << 24) | (bytes[tableEntry + 9] << 16) | (bytes[tableEntry + 10] << 8) | bytes[tableEntry + 11];
        const length = (bytes[tableEntry + 12] << 24) | (bytes[tableEntry + 13] << 16) | (bytes[tableEntry + 14] << 8) | bytes[tableEntry + 15];
        maxOffset = Math.max(maxOffset, offset + length);
      }
      if (!validTables || maxOffset <= 1000 || maxOffset >= 50000000) continue;
      if (!['head', 'cmap', 'name'].every(tag => tableTags.includes(tag))) continue;
      const fontBytes = bytes.subarray(i, Math.min(i + maxOffset + 1024, bytes.length));
      const ext = isOtf ? 'otf' : 'ttf';
      const fileName = fontIndex === 0 ? `custom_font.${ext}` : `custom_font_${fontIndex}.${ext}`;
      const fontBlob = new Blob([fontBytes], { type: isOtf ? 'font/otf' : 'font/ttf' });
      fontExtraFiles[fileName] = fontBlob;
      if (!uiData.fontBlob) uiData.fontBlob = fontBlob;
      fontIndex++;
      i += Math.min(maxOffset, fontBytes.length) - 1;
    }

    const readerData = {
      name: lightSchema.name || themeName,
      sourceFormat: 'reeden',
      textColor: toCssColor(lightSchema.textColor, '#3E3D3B'),
      textColorNight: toCssColor(darkSchema.textColor, '#ADADAD'),
      backgroundColor: toCssColor(lightSchema.backgroundColor, '#F4F1EC'),
      backgroundColorNight: toCssColor(darkSchema.backgroundColor, '#1E2428'),
      primaryColor: toCssColor(lightSchema.primaryColor, '#8A9E8B'),
      primaryColorNight: toCssColor(darkSchema.primaryColor, '#9CB09D'),
      bgBlob: readerLightImg ? readerLightImg.blob : null,
      bgBlobUrl: readerLightImg ? readerLightImg.url : null,
      bgDarkBlob: readerDarkImg ? readerDarkImg.blob : null,
      bgDarkBlobUrl: readerDarkImg ? readerDarkImg.url : null,
      layoutConfig: parseLayoutConfig(lightSchema),
      rawSchema: lightSchema,
      darkSchema,
      extraFiles: fontExtraFiles
    };

    item.hasUi = true;
    item.hasReader = true;
    item.sourceFormat = 'reeden';
    item.parsedUi = uiData;
    item.parsedReader = readerData;
    item.status = 'ready';
    renderQueue();
  }

  // Extract App UI from Redden (.red)
  async function extractRedUi(zip, meta) {
    const light = meta.light || {};
    const dark  = meta.dark  || {};
    const name  = meta.name  || 'Redden Theme';
    const d     = newParsedUi(name, 'reeden', light.primaryColor, dark.primaryColor, light.cardColor, dark.cardColor);
    d.raw.reeden = { theme: meta };
    d.backgroundColor = toCssColor(light.backgroundColor, d.backgroundColor);
    d.backgroundColorDark = toCssColor(dark.backgroundColor, d.backgroundColorDark);
    d.foregroundColor = toCssColor(light.foregroundColor, d.foregroundColor);
    d.foregroundColorDark = toCssColor(dark.foregroundColor, d.foregroundColorDark);
    d.mutedColor = toCssColor(light.mutedForegroundColor, d.mutedColor);
    d.mutedColorDark = toCssColor(dark.mutedForegroundColor, d.mutedColorDark);
    d.borderColor = toCssColor(light.borderColor, d.primaryColor);
    d.borderColorDark = toCssColor(dark.borderColor, d.primaryColorDark);
    d.accentColor = toCssColor(light.accentColor, d.primaryColor);
    d.accentColorDark = toCssColor(dark.accentColor, d.primaryColorDark);
    d.tabColor = toCssColor(light.tabBackgroundColor, d.cardColor);
    d.tabColorDark = toCssColor(dark.tabBackgroundColor, d.cardColorDark);
    d.shelfColor = toCssColor(light.shelfColor, d.primaryColor);
    d.shelfColorDark = toCssColor(dark.shelfColor, d.primaryColorDark);

    for (const p of ['light/theme_bg.img', 'light/theme_bg.jpg', 'light/theme_bg.png']) {
      if (zip.file(p)) {
        const blob = await zip.file(p).async('blob');
        d.bgBlob = blob;
        d.bgBlobUrl = URL.createObjectURL(blob);
        break;
      }
    }
    for (const p of ['dark/theme_bg.img', 'dark/theme_bg.jpg', 'dark/theme_bg.png']) {
      if (zip.file(p)) {
        const blob = await zip.file(p).async('blob');
        d.bgDarkBlob = blob;
        d.bgDarkBlobUrl = URL.createObjectURL(blob);
        break;
      }
    }

    const packId = light.navbarPackId;
    const NAV_MAP = {
      home:      ['home_normal.png'],
      bookshelf: ['bookshelf_normal.png'],
      explore:   ['feature_normal.png', 'discovery_normal.png'],
      rss:       ['notes_normal.png', 'rss_normal.png'],
      my:        ['statistics_normal.png', 'my_normal.png', 'settings_normal.png']
    };
    if (packId) {
      for (const [key, fns] of Object.entries(NAV_MAP)) {
        for (const fn of fns) {
          const f = zip.file(`navbar_pack/${packId}/${fn}`);
          if (f) {
            const blob = await f.async('blob');
            const selectedName = fn.includes('_normal') ? fn.replace('_normal', '_selected') : fn;
            const selectedFile = zip.file(`navbar_pack/${packId}/${selectedName}`);
            const selectedBlob = selectedFile ? await selectedFile.async('blob') : null;
            d.navIconsBlobs[key] = {
              blob,
              url: URL.createObjectURL(blob),
              selectedBlob,
              selectedUrl: selectedBlob ? URL.createObjectURL(selectedBlob) : null
            };
            break;
          }
        }
      }
    }

    const galleryId = light.coverGalleryId;
    if (galleryId) {
      const coverFiles = Object.keys(zip.files)
        .filter(n => n.startsWith(`cover_gallery/${galleryId}/`) && /\.(jpg|jpeg|png)$/i.test(n));
      for (const fn of coverFiles) {
        const blob = await zip.file(fn).async('blob');
        d.coversBlobs.push({ blob, url: URL.createObjectURL(blob) });
      }
    }

    // Extract Bookshelf Carousel Banner images
    const carouselFiles = Object.keys(zip.files).filter(n => n.includes('bookshelf_carousel') && (n.endsWith('.img') || n.endsWith('.jpg') || n.endsWith('.png')));
    for (const fn of carouselFiles) {
      const blob = await zip.file(fn).async('blob');
      d.carouselBlobs.push({ blob, url: URL.createObjectURL(blob) });
    }

    for (const fn of Object.keys(zip.files)) {
      if (/\.(ttf|otf)$/i.test(fn)) { d.fontBlob = await zip.file(fn).async('blob'); break; }
    }

    return d;
  }

  // Extract App UI from MD3 manifest.json + assets
  async function extractMd3Ui(zip, meta, item) {
    const cfg = meta.config || {};
    const fallbackName = item
      ? item.name.replace(/\.(zip|red|rgshare|rgtheme|rg)$/i, '').replace(/(MD3|Archive|arc|主题包|主题美化|排版美化|排版)/gi, '').replace(/[\s_\-·]+/g, ' ').trim()
      : 'MD3 Theme';
    const name = meta.name || cfg.themeName || fallbackName || 'MD3 Theme';
    const md3Color = value => isRealColor(value) ? value : undefined;
    const d = newParsedUi(
      name,
      'md3',
      md3Color(cfg.themeColor) ?? md3Color(cfg.cPrimary),
      md3Color(cfg.themeColorNight) ?? md3Color(cfg.cNPrimary),
      md3Color(cfg.bookshelfCardColor),
      md3Color(cfg.bookshelfCardColorDark)
    );
    d.md3PrimaryContainer = md3Color(cfg.cPrimary);
    d.raw.md3 = { manifest: meta };
    d.backgroundColor = isRealColor(cfg.themeBackgroundColor) ? toCssColor(cfg.themeBackgroundColor) : d.backgroundColor;
    d.backgroundColorDark = isRealColor(cfg.themeBackgroundColorNight) ? toCssColor(cfg.themeBackgroundColorNight) : d.backgroundColorDark;
    d.foregroundColor = isRealColor(cfg.primaryTextColor) ? toCssColor(cfg.primaryTextColor) : d.foregroundColor;
    d.foregroundColorDark = isRealColor(cfg.primaryTextColorNight) ? toCssColor(cfg.primaryTextColorNight) : d.foregroundColorDark;
    d.mutedColor = isRealColor(cfg.secondaryTextColor) ? toCssColor(cfg.secondaryTextColor) : d.mutedColor;
    d.mutedColorDark = isRealColor(cfg.secondaryTextColorNight) ? toCssColor(cfg.secondaryTextColorNight) : d.mutedColorDark;
    d.borderColor = isRealColor(cfg.baseCardBorderColor) ? toCssColor(cfg.baseCardBorderColor) : d.primaryColor;
    d.accentColor = d.primaryColor;
    d.accentColorDark = d.primaryColorDark;

    const assets = meta.assets || {};
    const loadAsset = async key => {
      const path = assets[key];
      if (!path || !zip.file(path)) return null;
      return await zip.file(path).async('blob');
    };

    const bgLight = await loadAsset('background.light');
    if (bgLight) {
      d.bgBlob = bgLight;
      d.bgBlobUrl = URL.createObjectURL(bgLight);
    }
    const bgDark = await loadAsset('background.dark');
    if (bgDark) {
      d.bgDarkBlob = bgDark;
      d.bgDarkBlobUrl = URL.createObjectURL(bgDark);
    }

    const navKeys = ['home', 'bookshelf', 'explore', 'rss', 'my'];
    for (const key of navKeys) {
      const normal = await loadAsset(`navigation.${key}`);
      if (!normal) continue;
      const selected = await loadAsset(`navigation.${key}.selected`);
      d.navIconsBlobs[key] = {
        blob: normal,
        url: URL.createObjectURL(normal),
        selectedBlob: selected || null,
        selectedUrl: selected ? URL.createObjectURL(selected) : null
      };
      const dark = await loadAsset(`navigation.${key}.dark`);
      if (dark) {
        const darkSelected = await loadAsset(`navigation.${key}.selected.dark`);
        d.navIconsDarkBlobs[key] = {
          blob: dark,
          url: URL.createObjectURL(dark),
          selectedBlob: darkSelected || null,
          selectedUrl: darkSelected ? URL.createObjectURL(darkSelected) : null
        };
      }
    }

    for (const album of (meta.coverAlbums || [])) {
      for (const item of (album.lightImages || [])) {
        if (item.path && zip.file(item.path)) {
          const blob = await zip.file(item.path).async('blob');
          d.coversBlobs.push({ blob, url: URL.createObjectURL(blob) });
        }
      }
      for (const item of (album.darkImages || [])) {
        if (item.path && zip.file(item.path)) {
          const blob = await zip.file(item.path).async('blob');
          d.coversDarkBlobs.push({ blob, url: URL.createObjectURL(blob) });
        }
      }
    }

    const fontBlob = await loadAsset('font.app');
    if (fontBlob) d.fontBlob = fontBlob;
    return d;
  }

  // Extract App UI from Archive appearance_kit.json + nested component zips
  async function extractArcUi(zip, meta) {
    const name = meta.name || 'Archive Theme';
    const d = newParsedUi(name, 'archive');
    d.raw.archive = { appearanceKit: meta, themes: {}, topBars: {}, navigation: null, collections: [] };

    const findIn = (subNames, suffix) => subNames.find(n => n === suffix) || subNames.find(n => n.endsWith('/' + suffix)) || subNames.find(n => n.endsWith(suffix));
    const baseOf = path => path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
    const loadBlob = async (subZip, path) => {
      if (!path || !subZip.file(path)) return null;
      return await subZip.file(path).async('blob');
    };
    const resolveAssetPath = (subNames, prefix, path) => {
      if (!path) return null;
      const baseName = String(path).split('/').pop().split('\\').pop();
      const isAbsolute = /^([a-z]+:|\/)/i.test(String(path));
      if (isAbsolute) {
        return subNames.find(n => n.endsWith('/' + baseName) || n === baseName) || null;
      }
      return prefix + path;
    };

    for (const comp of (meta.components || [])) {
      if (!comp.path || !zip.file(comp.path)) continue;
      const bytes = await zip.file(comp.path).async('arraybuffer');
      const subZip = await JSZip.loadAsync(bytes);
      const subNames = Object.keys(subZip.files).filter(n => !subZip.files[n].dir);

      if (comp.type === 'THEME') {
        const tjFile = findIn(subNames, 'theme.json');
        if (!tjFile) continue;
        const tj = JSON.parse(await subZip.file(tjFile).async('text'));
        const cfg = tj.config || {};
        const prefix = baseOf(tjFile);
        const night = !!comp.isNight;
        d.raw.archive.themes[night ? 'night' : 'day'] = { json: tj, dirName: tj.dirName || comp.dirName || '' };

        if (!night) {
          if (cfg.themeName) d.name = cfg.themeName;
          d.primaryColor = toCssColor(cfg.primaryColor, d.primaryColor);
          d.accentColor = toCssColor(cfg.accentColor, d.primaryColor);
          d.backgroundColor = toCssColor(cfg.backgroundColor, d.backgroundColor);
          d.cardColor = toCssColor(cfg.tabBackgroundColor, d.cardColor);
          d.foregroundColor = toCssColor(cfg.uiFontColor, d.foregroundColor);
          d.mutedColor = toCssColor(cfg.mutedColor || cfg.uiFontColor, d.mutedColor);
          d.borderColor = toCssColor(cfg.panelBorderColor, d.primaryColor);
          d.tabColor = toCssColor(cfg.tabBackgroundColor, d.cardColor);
          d.shelfColor = toCssColor(cfg.shelfColor, d.primaryColor);
          d.bgBlob = await loadBlob(subZip, cfg.backgroundImgPath ? resolveAssetPath(subNames, prefix, cfg.backgroundImgPath) : subNames.find(n => /\.(jpg|jpeg|png|webp)$/i.test(n)));
          if (d.bgBlob) d.bgBlobUrl = URL.createObjectURL(d.bgBlob);
          if (cfg.uiFontPath) d.fontBlob = await loadBlob(subZip, resolveAssetPath(subNames, prefix, cfg.uiFontPath));
        } else {
          d.primaryColorDark = toCssColor(cfg.primaryColor, d.primaryColorDark);
          d.accentColorDark = toCssColor(cfg.accentColor, d.primaryColorDark);
          d.backgroundColorDark = toCssColor(cfg.backgroundColor, d.backgroundColorDark);
          d.cardColorDark = toCssColor(cfg.tabBackgroundColor, d.cardColorDark);
          d.foregroundColorDark = toCssColor(cfg.uiFontColor, d.foregroundColorDark);
          d.mutedColorDark = toCssColor(cfg.mutedColor || cfg.uiFontColor, d.mutedColorDark);
          d.borderColorDark = toCssColor(cfg.panelBorderColor, d.primaryColorDark);
          d.tabColorDark = toCssColor(cfg.tabBackgroundColor, d.cardColorDark);
          d.shelfColorDark = toCssColor(cfg.shelfColor, d.primaryColorDark);
          d.bgDarkBlob = await loadBlob(subZip, cfg.backgroundImgPath ? resolveAssetPath(subNames, prefix, cfg.backgroundImgPath) : subNames.find(n => /\.(jpg|jpeg|png|webp)$/i.test(n)));
          if (d.bgDarkBlob) d.bgDarkBlobUrl = URL.createObjectURL(d.bgDarkBlob);
        }
      } else if (comp.type === 'TOP_BAR') {
        const tbFile = findIn(subNames, 'top_bar.json');
        if (!tbFile) continue;
        d.raw.archive.topBars[comp.isNight ? 'night' : 'day'] = JSON.parse(await subZip.file(tbFile).async('text'));
      } else if (comp.type === 'NAVIGATION_BAR') {
        const navFile = findIn(subNames, 'navigation.json');
        if (!navFile) continue;
        const nav = JSON.parse(await subZip.file(navFile).async('text'));
        d.raw.archive.navigation = nav;
        const prefix = baseOf(navFile);
        const icons = nav.icons || {};
        const NAV_ALIAS = {
          home: 'home',
          bookshelf: 'bookshelf',
          discovery: 'explore',
          feature: 'explore',
          rss: 'rss',
          notes: 'rss',
          readRecord: 'reader',
          my: 'my',
          settings: 'my',
          search: 'search'
        };
        for (const [iconKey, fileName] of Object.entries(icons)) {
          const base = iconKey.replace(/_(normal|selected)$/i, '');
          const target = NAV_ALIAS[base];
          if (!target) continue;
          const isSelected = /_selected$/i.test(iconKey);
          const blob = await loadBlob(subZip, prefix + fileName);
          if (!blob) continue;
          if (!d.navIconsBlobs[target]) d.navIconsBlobs[target] = {};
          if (isSelected) {
            d.navIconsBlobs[target].selectedBlob = blob;
            d.navIconsBlobs[target].selectedUrl = URL.createObjectURL(blob);
          } else {
            d.navIconsBlobs[target].blob = blob;
            d.navIconsBlobs[target].url = URL.createObjectURL(blob);
          }
        }
      } else if (comp.type === 'COVER_COLLECTION') {
        const colFile = findIn(subNames, 'collection.json');
        if (!colFile) continue;
        const collection = JSON.parse(await subZip.file(colFile).async('text'));
        const prefix = baseOf(colFile);
        d.raw.archive.collections.push(collection);
        const images = Array.isArray(collection.images) && collection.images.length
          ? collection.images
          : subNames.filter(n => /\.(jpg|jpeg|png|webp)$/i.test(n));
        for (const imagePath of images) {
          const blob = await loadBlob(subZip, prefix + imagePath);
          if (blob) d.coversBlobs.push({ blob, url: URL.createObjectURL(blob) });
        }
      }
    }

    return d;
  }

  // Extract Reader Typesetting from RED
  async function extractRedReader(zip, schemaMeta) {
    let layoutCfg = {};
    if (schemaMeta.layoutConfig) {
      if (typeof schemaMeta.layoutConfig === 'string') {
        try { layoutCfg = JSON.parse(schemaMeta.layoutConfig); } catch(e){}
      } else if (typeof schemaMeta.layoutConfig === 'object') {
        layoutCfg = schemaMeta.layoutConfig;
      }
    }

    const darkSchema = schemaMeta.darkColorSchema || layoutCfg.darkColorSchema || {};
    const r = {
      name: schemaMeta.name || 'Reeden 排版',
      sourceFormat: 'reeden',
      textColor: toCssColor(schemaMeta.textColor, '#3E3D3B'),
      textColorNight: toCssColor(darkSchema.textColor, '#ADADAD'),
      backgroundColor: toCssColor(schemaMeta.backgroundColor, '#F4F1EC'),
      backgroundColorNight: toCssColor(darkSchema.backgroundColor, '#1E2428'),
      primaryColor: toCssColor(schemaMeta.primaryColor, '#8A9E8B'),
      primaryColorNight: toCssColor(darkSchema.primaryColor, '#9CB09D'),
      bgBlob: null,
      bgBlobUrl: null,
      bgDarkBlob: null,
      bgDarkBlobUrl: null,
      layoutConfig: layoutCfg,
      rawSchema: schemaMeta,
      extraFiles: {}
    };

    const bgFile = Object.keys(zip.files).find(n => n.includes('reader_schema') && (n.endsWith('.img') || n.endsWith('.jpg') || n.endsWith('.png')));
    if (bgFile) {
      const blob = await zip.file(bgFile).async('blob');
      r.bgBlob = blob;
      r.bgBlobUrl = URL.createObjectURL(blob);
    }

    for (const fn of Object.keys(zip.files)) {
      if (/\.(ttf|otf)$/i.test(fn) && !zip.files[fn].dir) {
        const baseFn = fn.split('/').pop().split('\\').pop();
        const blob = await zip.file(fn).async('blob');
        r.extraFiles[baseFn] = blob;
      }
    }

    return r;
  }

  // Extract Reader Typesetting from Arc / MD3 Zip
  async function extractZipReader(zip, readCfg) {
    const isArchive = readCfg.underlineMode !== undefined || readCfg.paperEffect !== undefined || readCfg.tipColor !== undefined;
    const r = {
      name: readCfg.name || '排版美化',
      sourceFormat: isArchive ? 'archive' : 'md3',
      textColor: toCssColor(readCfg.textColor, '#3E3D3B'),
      textColorNight: toCssColor(readCfg.textColorNight, '#ADADAD'),
      backgroundColor: toCssColor(readCfg.backgroundColor, '#F4F1EC'),
      backgroundColorNight: toCssColor(readCfg.backgroundColorNight, '#1E2428'),
      primaryColor: toCssColor(readCfg.textAccentColor, '#8A9E8B'),
      primaryColorNight: toCssColor(readCfg.textAccentColorNight, '#FE4D55'),
      readConfig: readCfg,
      rawReadConfig: readCfg,
      bgBlob: null,
      bgBlobUrl: null,
      bgDarkBlob: null,
      bgDarkBlobUrl: null,
      extraFiles: {}
    };

    const bgStr = readCfg.bgStr || '';
    const bgFilename = bgStr.split('/').pop().split('\\').pop();
    const bgDarkStr = readCfg.bgStrNight || '';
    const bgDarkFilename = /\.(jpg|jpeg|png|webp)$/i.test(bgDarkStr) ? bgDarkStr.split('/').pop().split('\\').pop() : '';

    for (const fn of Object.keys(zip.files)) {
      if (fn !== 'readConfig.json' && !zip.files[fn].dir) {
        const baseFn = fn.split('/').pop().split('\\').pop();
        const blob = await zip.files[fn].async('blob');
        if (baseFn === bgFilename) {
          r.bgBlob = blob;
          r.bgBlobUrl = URL.createObjectURL(blob);
        } else if (bgDarkFilename && baseFn === bgDarkFilename) {
          r.bgDarkBlob = blob;
          r.bgDarkBlobUrl = URL.createObjectURL(blob);
        } else {
          r.extraFiles[baseFn] = blob;
        }
      }
    }

    r.layoutConfig = {
      fontSize: Number(readCfg.textSize) || 16,
      lineSpacing: Number(readCfg.lineSpacingExtra) || 0,
      paragraphSpacing: Number(readCfg.paragraphSpacing) || 0,
      paragraphIndent: readCfg.paragraphIndent || '　　',
      paddingTop: Number(readCfg.paddingTop) || 0,
      paddingBottom: Number(readCfg.paddingBottom) || 0,
      paddingLeft: Number(readCfg.paddingLeft) || 0,
      paddingRight: Number(readCfg.paddingRight) || 0,
      titleSize: Number(readCfg.titleSize) || 0,
      titleTopSpacing: Number(readCfg.titleTopSpacing) || 0,
      titleBottomSpacing: Number(readCfg.titleBottomSpacing) || 0,
      titleMode: Number(readCfg.titleMode) || 0,
      letterSpacing: Number(readCfg.letterSpacing) || 0
    };

    return r;
  }

  // Extract App UI and Reader Typesetting from .rgshare
  async function extractRgShare(zip, item) {
    const names = Object.keys(zip.files);
    let meta = {};
    let themeData = {};

    if (names.includes('meta.json')) {
      try { meta = JSON.parse(await zip.file('meta.json').async('text')); } catch(e){}
    }
    if (names.includes('theme.json')) {
      try { themeData = JSON.parse(await zip.file('theme.json').async('text')); } catch(e){}
    }

    const themeName = (themeData["1"] || meta.appTheme?.name || item.name.replace(/\.(rgshare|rgtheme|rg)$/i, '')).replace(/[\r\n\t]/g, '').trim();
    const colors = themeData["2"] || {};
    const primaryColor = colors["6"] ? ('#' + String(colors["6"]).replace(/^#/, '').slice(0, 6)) : '#716758';
    const cardColor = colors["8"] ? ('#' + String(colors["8"]).replace(/^#/, '').slice(0, 6)) : '#E8E3CD';
    const cardColorDark = colors["10"] ? ('#' + String(colors["10"]).replace(/^#/, '').slice(0, 6)) : '#1C1C1E';

    const uiData = newParsedUi(themeName, 'rgshare', primaryColor, '#F5F5F5', cardColor, cardColorDark);

    // App UI Background Image (Day = Warm Sepia _dark.jpg, Night = Cool Gray _light.jpg)
    const bgFiles = meta.appTheme?.backgroundImageFiles || [];
    let bgWarmTarget = bgFiles.find(f => f.includes('dark') && names.includes(f));
    let bgCoolTarget = bgFiles.find(f => f.includes('light') && names.includes(f)) || bgFiles.find(f => names.includes(f)) || names.find(n => n.startsWith('images/') && /\.(jpg|jpeg|png)$/i.test(n));

    if (!bgWarmTarget) bgWarmTarget = bgCoolTarget;

    // Day mode uses Warm Sepia
    if (bgWarmTarget && zip.file(bgWarmTarget)) {
      const blob = await zip.file(bgWarmTarget).async('blob');
      uiData.bgBlob = blob;
      uiData.bgBlobUrl = URL.createObjectURL(blob);
    }
    // Night mode uses Cool Gray
    if (bgCoolTarget && zip.file(bgCoolTarget)) {
      const blob = await zip.file(bgCoolTarget).async('blob');
      uiData.bgDarkBlob = blob;
      uiData.bgDarkBlobUrl = URL.createObjectURL(blob);
    }

    // Day Tabbar Icons (Warm Sepia = tabBarProfileDark)
    uiData.navIconsBlobs = {};
    const tabbarFiles = meta.tabBarProfileDark?.files || names.filter(n => n.includes('resources/tabbar_dark/') && n.endsWith('.png'));
    const NAV_MAP = { shelf: 'bookshelf', library: 'explore', statistic: 'rss', mine: 'my', home: 'home' };
    for (const tf of tabbarFiles) {
      if (zip.file(tf)) {
        const tfName = tf.split('/').pop().toLowerCase();
        for (const [key, navKey] of Object.entries(NAV_MAP)) {
          if (tfName.includes(key)) {
            const isSelected = tfName.includes('selected');
            const isNormal = tfName.includes('normal');
            if (isNormal || isSelected) {
              const blob = await zip.file(tf).async('blob');
              const url = URL.createObjectURL(blob);
              if (!uiData.navIconsBlobs[navKey]) uiData.navIconsBlobs[navKey] = {};
              if (isSelected) {
                uiData.navIconsBlobs[navKey].selectedBlob = blob;
                uiData.navIconsBlobs[navKey].selectedUrl = url;
              } else {
                uiData.navIconsBlobs[navKey].blob = blob;
                uiData.navIconsBlobs[navKey].url = url;
              }
              break;
            }
          }
        }
      }
    }

    // Night Tabbar Icons (Cool Gray = tabBarProfile)
    uiData.navIconsDarkBlobs = {};
    const tabbarDarkFiles = meta.tabBarProfile?.files || names.filter(n => n.includes('resources/tabbar/') && !n.includes('tabbar_dark') && n.endsWith('.png'));
    for (const tf of tabbarDarkFiles) {
      if (zip.file(tf)) {
        const tfName = tf.split('/').pop().toLowerCase();
        for (const [key, navKey] of Object.entries(NAV_MAP)) {
          if (tfName.includes(key)) {
            const isSelected = tfName.includes('selected');
            const isNormal = tfName.includes('normal');
            if (isNormal || isSelected) {
              const blob = await zip.file(tf).async('blob');
              const url = URL.createObjectURL(blob);
              if (!uiData.navIconsDarkBlobs[navKey]) uiData.navIconsDarkBlobs[navKey] = {};
              if (isSelected) {
                uiData.navIconsDarkBlobs[navKey].selectedBlob = blob;
                uiData.navIconsDarkBlobs[navKey].selectedUrl = url;
              } else {
                uiData.navIconsDarkBlobs[navKey].blob = blob;
                uiData.navIconsDarkBlobs[navKey].url = url;
              }
              break;
            }
          }
        }
      }
    }

    // Day Book Covers (Warm Sepia = coverDark)
    const coverFiles = meta.coverDark?.files || names.filter(n => n.includes('resources/cover_dark/') && /\.(jpg|jpeg|png)$/i.test(n));
    for (const cf of coverFiles) {
      if (zip.file(cf)) {
        const blob = await zip.file(cf).async('blob');
        uiData.coversBlobs.push({ blob, url: URL.createObjectURL(blob) });
      }
    }

    // Night Book Covers (Cool Gray = cover)
    uiData.coversDarkBlobs = [];
    const coverDarkFiles = meta.cover?.files || names.filter(n => n.includes('resources/cover/') && !n.includes('cover_dark') && /\.(jpg|jpeg|png)$/i.test(n));
    for (const cf of coverDarkFiles) {
      if (zip.file(cf)) {
        const blob = await zip.file(cf).async('blob');
        uiData.coversDarkBlobs.push({ blob, url: URL.createObjectURL(blob) });
      }
    }

    item.hasUi = true;
    item.sourceFormat = 'rgshare';
    item.parsedUi = uiData;

    // Reader Typesetting (Day = readerThemeDark 暖黄, Night = readerTheme 冷灰)
    const readerDarkThemePath = meta.readerThemeDark?.filePath || 'resources/reader_theme_dark/theme.json';
    const readerThemePath = meta.readerTheme?.filePath || 'resources/reader_theme/theme.json';

    let readerDarkJson = {};
    if (names.includes(readerDarkThemePath)) {
      try { readerDarkJson = JSON.parse(await zip.file(readerDarkThemePath).async('text')); } catch(e){}
    }

    let readerJson = {};
    if (names.includes(readerThemePath)) {
      try { readerJson = JSON.parse(await zip.file(readerThemePath).async('text')); } catch(e){}
    }

    // Day mode = readerThemeDark (暖黄)
    let readerWarmBgPath = meta.readerThemeDark?.backgroundImagePath || (readerDarkJson.backgroundImage ? `resources/reader_theme_dark/${readerDarkJson.backgroundImage}` : '');
    let bgWarmReaderBlob = null;
    let bgWarmReaderUrl = null;

    if (readerWarmBgPath && zip.file(readerWarmBgPath)) {
      bgWarmReaderBlob = await zip.file(readerWarmBgPath).async('blob');
      bgWarmReaderUrl = URL.createObjectURL(bgWarmReaderBlob);
    }

    // Night mode = readerTheme (冷灰)
    let readerCoolBgPath = meta.readerTheme?.backgroundImagePath || (readerJson.backgroundImage ? `resources/reader_theme/${readerJson.backgroundImage}` : '');
    let bgCoolReaderBlob = null;
    let bgCoolReaderUrl = null;

    if (readerCoolBgPath && zip.file(readerCoolBgPath)) {
      bgCoolReaderBlob = await zip.file(readerCoolBgPath).async('blob');
      bgCoolReaderUrl = URL.createObjectURL(bgCoolReaderBlob);
    }

    let rawTextColor = readerDarkJson.textColor ? String(readerDarkJson.textColor).trim() : '474747';
    let textColor = rawTextColor.startsWith('#') ? rawTextColor : ('#' + rawTextColor);

    let rawTextColorNight = readerJson.textColor ? String(readerJson.textColor).trim() : '5C5C5C';
    let textColorNight = rawTextColorNight.startsWith('#') ? rawTextColorNight : ('#' + rawTextColorNight);

    let rawBgColor = readerDarkJson.backgroundColor ? String(readerDarkJson.backgroundColor).trim() : 'FFFFFF';
    let backgroundColor = rawBgColor.startsWith('#') ? rawBgColor : ('#' + rawBgColor);

    const extraFiles = {};
    for (const fn of names) {
      if (/\.(ttf|otf|woff|woff2|ttc)$/i.test(fn) && !zip.files[fn].dir) {
        const baseFn = fn.split('/').pop();
        extraFiles[baseFn] = await zip.file(fn).async('blob');
      }
    }

    const readerData = {
      name: themeName,
      textColor: textColor,
      textColorNight: textColorNight,
      backgroundColor: backgroundColor,
      bgBlob: bgWarmReaderBlob,
      bgBlobUrl: bgWarmReaderUrl,
      bgDarkBlob: bgCoolReaderBlob,
      bgDarkBlobUrl: bgCoolReaderUrl,
      layoutConfig: {
        fontSize: readerDarkJson.bodyFontSize || readerJson.bodyFontSize || 18,
        lineSpacing: readerDarkJson.themeLineSpacing || readerJson.themeLineSpacing || 14,
        paragraphSpacing: readerDarkJson.themeParagraphSpacing || readerJson.themeParagraphSpacing || 19,
        paddingTop: readerDarkJson.themePaddingTop || readerJson.themePaddingTop || 24,
        paddingLeft: readerDarkJson.themePaddingLeft || readerJson.themePaddingLeft || 43,
        paddingRight: readerDarkJson.themePaddingRight || readerJson.themePaddingRight || 49,
        paddingBottom: readerDarkJson.themePaddingBottom || readerJson.themePaddingBottom || 19
      },
      extraFiles
    };

    item.hasReader = true;
    item.parsedReader = readerData;
    item.status = 'ready';
    renderQueue();
    if (state.activeId === item.id) {
      applyPreview(item);
    }
  }

  function newParsedUi(name, type, primaryColor = '#FF8909', primaryColorDark = '#9CB09D', cardColor = '#FFFFFF', cardColorDark = '#2C343A') {
    const primary = toCssColor(primaryColor, '#8A9E8B');
    const primaryDark = toCssColor(primaryColorDark, '#9CB09D');
    const card = toCssColor(cardColor, '#FFFFFF');
    const cardDark = toCssColor(cardColorDark, '#2C343A');
    return {
      name,
      type,
      primaryColor: primary,
      primaryColorDark: primaryDark,
      cardColor: card,
      cardColorDark: cardDark,
      backgroundColor: '#F4F1EC',
      backgroundColorDark: '#1E2428',
      foregroundColor: '#2C2A27',
      foregroundColorDark: '#E8E4DE',
      mutedColor: '#968E84',
      mutedColorDark: '#B0A89E',
      borderColor: primary,
      borderColorDark: primaryDark,
      accentColor: primary,
      accentColorDark: primaryDark,
      tabColor: card,
      tabColorDark: cardDark,
      shelfColor: primary,
      shelfColorDark: primaryDark,
      bgBlobUrl: null,
      bgBlob: null,
      bgDarkBlobUrl: null,
      bgDarkBlob: null,
      navIconsBlobs: {},
      navIconsDarkBlobs: {},
      coversBlobs: [],
      coversDarkBlobs: [],
      carouselBlobs: [],
      fontBlob: null,
      raw: {}
    };
  }

  // ── Apply Preview to Phone Mockup ─────────────────────────────────
  function applyPreview(item) {
    if (!item) return;
    const uiData = item.parsedUi;
    const readerData = item.parsedReader;
    const isNight = state.mockupMode === 'dark';
    const displayName = themeNameInput.value.trim() || (uiData ? uiData.name : readerData ? readerData.name : item.name);

    previewTitle.textContent = '书架';
    if (!themeNameInput.value) {
      themeNameInput.value = displayName;
    }

    // App UI Background Image
    const activeBgUrl = isNight && uiData?.bgDarkBlobUrl ? uiData.bgDarkBlobUrl : uiData?.bgBlobUrl;
    if (activeBgUrl) {
      phoneScreen.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.08)), url('${activeBgUrl}')`;
    } else {
      phoneScreen.style.backgroundImage = 'none';
    }

    // App UI Card Color
    const activeCardColor = isNight && uiData?.cardColorDark ? uiData.cardColorDark : uiData?.cardColor;
    if (phoneCard && activeCardColor) {
      let cssColor = activeCardColor;
      if (cssColor.length === 9 && cssColor.startsWith('#')) cssColor = '#' + cssColor.slice(3);
      phoneCard.style.backgroundColor = cssColor;
    }

    // Nav icons
    const activeNavMap = isNight && uiData?.navIconsDarkBlobs && Object.keys(uiData.navIconsDarkBlobs).length ? uiData.navIconsDarkBlobs : uiData?.navIconsBlobs;
    Object.keys(navWrappers).forEach(key => {
      const wrap = navWrappers[key];
      if (activeNavMap && activeNavMap[key]) {
        wrap.innerHTML = `<img src="${activeNavMap[key].url}" alt="${key}" style="width:22px;height:22px;object-fit:contain;border-radius:4px;">`;
      } else {
        const FA_MAP = { home: 'fa-house', bookshelf: 'fa-book-bookmark', explore: 'fa-compass', rss: 'fa-rss', my: 'fa-circle-user' };
        wrap.innerHTML = `<i class="fa-solid ${FA_MAP[key]}"></i>`;
      }
    });

    // Cover gallery
    const activeCovers = isNight && uiData?.coversDarkBlobs && uiData.coversDarkBlobs.length ? uiData.coversDarkBlobs : uiData?.coversBlobs;
    galleryGrid.innerHTML = '';
    if (activeCovers && activeCovers.length) {
      activeCovers.forEach(c => {
        const img = document.createElement('img');
        img.className = 'gallery-item';
        img.src = c.url;
        galleryGrid.appendChild(img);
      });
      injectCoverIntoCard('cover0Wrap', activeCovers[0]);
      if (activeCovers.length > 1) injectCoverIntoCard('cover1Wrap', activeCovers[1]);
    } else {
      galleryGrid.innerHTML = `<div class="gallery-empty"><i class="fa-regular fa-image"></i><span>暂无书单封面</span></div>`;
    }

    // Reader Screen Typesetting Live Preview (Pure Direct Layout)
    if (readerData) {
      readerBookName.textContent = displayName;
      readerTitleText.textContent = '第一章 序章';

      const activeReaderBgUrl = isNight && readerData.bgDarkBlobUrl ? readerData.bgDarkBlobUrl : readerData.bgBlobUrl;
      if (activeReaderBgUrl) {
        readerScreen.style.backgroundImage = `url('${activeReaderBgUrl}')`;
      } else {
        readerScreen.style.backgroundImage = 'none';
        readerScreen.style.backgroundColor = readerData.backgroundColor || (isNight ? '#1e2428' : '#f4f1ec');
      }

      let textColor = isNight ? (readerData.textColorNight || '#5C5C5C') : (readerData.textColor || '#474747');
      readerScreen.style.color = textColor;

      const layout = readerData.layoutConfig || (readerData.readConfig || {});
      const fontSize = layout.fontSize || layout.textSize || 11;
      const lineSpacing = layout.lineSpacing || layout.lineSpacingExtra || 14;

      readerBody.style.fontSize = Math.min(Math.max(fontSize, 10), 16) + 'px';
      readerBody.style.lineHeight = (1.4 + lineSpacing / 30).toFixed(2);
      
      const pIndent = layout.paragraphIndent !== undefined ? layout.paragraphIndent : '2em';

      // Accent Color, Underline & Text Shadow
      const accentColor = (readerData.readConfig && readerData.readConfig.textAccentColor) || '#8a9e8b';
      const underlineColor = (readerData.readConfig && readerData.readConfig.underlineColor) || textColor;
      const dialogue = $('readerDialogue');
      if (dialogue) {
        dialogue.style.borderColor = accentColor;
      }
      const underlineEl = $('readerUnderlineText');
      if (underlineEl) {
        underlineEl.style.textDecorationColor = underlineColor;
      }
      if (readerData.readConfig && readerData.readConfig.textShadow) {
        readerBody.style.textShadow = '1px 1px 2px rgba(0,0,0,0.35)';
      } else {
        readerBody.style.textShadow = 'none';
      }

      // Check Highlight Rule Background Images
      let hasHighlightImage = false;
      if (readerData.extraFiles) {
        const hlBgKey = Object.keys(readerData.extraFiles).find(fn => fn.includes('highlight_rule_bg') && /\.(png|jpg|jpeg)$/i.test(fn));
        if (hlBgKey) {
          hasHighlightImage = true;
          const hlUrl = URL.createObjectURL(readerData.extraFiles[hlBgKey]);
          if (dialogue) {
            dialogue.style.backgroundImage = `url('${hlUrl}')`;
            dialogue.style.backgroundSize = 'cover';
          }
        }
      }

      // Check custom font loading
      let hasCustomFont = false;
      if (readerData.extraFiles) {
        const fontKey = Object.keys(readerData.extraFiles).find(fn => /\.(ttf|otf)$/i.test(fn));
        if (fontKey) {
          hasCustomFont = true;
          const fontBlob = readerData.extraFiles[fontKey];
          const fontUrl = URL.createObjectURL(fontBlob);
          const fontFace = new FontFace('CustomReaderFont', `url(${fontUrl})`);
          fontFace.load().then(loadedFont => {
            document.fonts.add(loadedFont);
            readerScreen.style.fontFamily = 'CustomReaderFont, var(--font)';
          }).catch(e => console.warn('[CustomFont load failed]', e));
        }
      }
      if (!hasCustomFont) {
        readerScreen.style.fontFamily = 'var(--font)';
      }

      updateSwatch('swatchReaderText', textColor);
      $('metaReaderText').textContent = textColor;
      $('metaReaderBg').textContent = (readerData.bgBlobUrl ? '背景图' : '基础色') + (hasCustomFont ? ' + 提取字体' : '');
      const metaHl = $('metaHighlights');
      if (metaHl) metaHl.textContent = (hasHighlightImage ? '已提取' : '无');
    }

    // Metadata
    const typeParts = [];
    if (item.hasUi) typeParts.push('界面美化');
    if (item.hasReader) typeParts.push('阅读排版');
    $('metaType').textContent = typeParts.join(' + ') || '未载入';

    if (uiData) {
      updateSwatch('swatchPrimary', uiData.primaryColor);
      $('metaPrimary').textContent = uiData.primaryColor;
      updateSwatch('swatchPrimaryDark', uiData.primaryColorDark);
      $('metaPrimaryDark').textContent = uiData.primaryColorDark;
      updateSwatch('swatchCard', uiData.cardColor);
      $('metaCard').textContent = uiData.cardColor;
      $('metaBg').textContent = uiData.bgBlobUrl ? '已提取' : '无';
      $('metaNavIcons').textContent = `${Object.keys(uiData.navIconsBlobs).length}/5`;
      $('metaCovers').textContent = `${uiData.coversBlobs.length} 张`;
    }
  }

  function updateSwatch(id, hex) {
    const el = $(id);
    if (!el) return;
    let cssHex = hex;
    if (cssHex && cssHex.length === 9 && cssHex.startsWith('#')) {
      cssHex = '#' + cssHex.slice(3);
    }
    el.style.background = cssHex || '#ccc';
  }

  function injectCoverIntoCard(wrapId, cover) {
    const wrap = $(wrapId);
    if (!wrap) return;
    wrap.innerHTML = `<img src="${cover.url}" alt="Cover">`;
  }

  function resetPreview() {
    previewTitle.textContent = '阅读 Archive';
    themeNameInput.value = '';
    phoneScreen.style.backgroundImage = 'none';
    galleryGrid.innerHTML = `<div class="gallery-empty"><i class="fa-regular fa-image"></i><span>暂无书单封面</span></div>`;
    const FA_MAP = { home: 'fa-house', bookshelf: 'fa-book-bookmark', explore: 'fa-compass', rss: 'fa-rss', my: 'fa-circle-user' };
    Object.keys(navWrappers).forEach(key => {
      navWrappers[key].innerHTML = `<i class="fa-solid ${FA_MAP[key]}"></i>`;
    });
    $('cover0Wrap').innerHTML = `<i class="fa-solid fa-book-open"></i>`;
    $('cover1Wrap').innerHTML = `<i class="fa-solid fa-book"></i>`;
    $('bookTitle0').textContent = '示例图书 A';
    $('bookAuthor0').textContent = '示例作者 A';
    $('bookTitle1').textContent = '示例图书 B';
    $('bookAuthor1').textContent = '示例作者 B';
    $('metaType').textContent = '未载入';
  }

  // Generate Combined Full Theme Blob (UI + Reader Typesetting)
  async function generateMd3FullBlob(item) {
    const uiBlob = item.hasUi ? await generateMd3UiBlob(item) : null;
    const readerBlob = item.hasReader ? await generateMd3ReaderBlob(item) : null;

    if (uiBlob && !readerBlob) return uiBlob;
    if (readerBlob && !uiBlob) return readerBlob;
    if (!uiBlob && !readerBlob) return null;

    const zip = new JSZip();
    try {
      const uiZip = await JSZip.loadAsync(await uiBlob.arrayBuffer());
      for (const filename of Object.keys(uiZip.files)) {
        if (!uiZip.files[filename].dir) {
          zip.file(filename, await uiZip.files[filename].async('arraybuffer'));
        }
      }
      const readerZip = await JSZip.loadAsync(await readerBlob.arrayBuffer());
      for (const filename of Object.keys(readerZip.files)) {
        if (!readerZip.files[filename].dir) {
          zip.file(filename, await readerZip.files[filename].async('arraybuffer'));
        }
      }
    } catch(e) {
      console.warn('[Full Blob Combine Failed, fallback to uiBlob]', e);
      return uiBlob || readerBlob;
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  // ── Archive Packaging ─────────────────────────────────────────────
  async function zipFilesFromBlob(blob) {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const files = {};
    for (const path of Object.keys(zip.files)) {
      const entry = zip.files[path];
      if (!entry.dir) files[path] = await entry.async('arraybuffer');
    }
    return files;
  }

  function safeTargetName(name) {
    return String(name || '主题')
      .replace(/[\\/:*?"<>|\r\n]+/g, '_')
      .replace(/\s+/g, ' ')
      .trim() || '主题';
  }

  // ── Archive (阅读 Archive) native package ────────────────────────
  function buildArchiveThemeConfig(d, isNight, name, bgName, fontName) {
    // Archive applies uiLayoutAlpha to the whole UI layer, including text.
    // Any value below 100 blends black text toward the wallpaper and makes it gray.
    const layoutAlpha = 100;
    const p = isNight ? {
      primary: d.primaryColorDark,
      background: d.backgroundColorDark,
      card: d.cardColorDark,
      foreground: d.foregroundColorDark,
      muted: d.mutedColorDark,
      border: d.borderColorDark,
      accent: d.accentColorDark
    } : {
      primary: d.primaryColor,
      background: d.backgroundColor,
      card: d.cardColor,
      foreground: d.foregroundColor,
      muted: d.mutedColor,
      border: d.borderColor,
      accent: d.accentColor
    };
    return {
      accentColor: toCssColor(p.accent, p.primary),
      backgroundColor: toCssColor(p.background, isNight ? '#1E2428' : '#F4F1EC'),
      backgroundImgBlur: 0,
      backgroundImgPath: bgName || '',
      bottomBackground: toCssColor(p.background, isNight ? '#1E2428' : '#F4F1EC'),
      cardColor: toCssColor(p.card, isNight ? '#2C343A' : '#FFFFFF'),
      dialogAlpha: isNight ? 100 : 79,
      fontScale: 0,
      isNightTheme: !!isNight,
      panelBackgroundScaleType: 'fit',
      panelBorderAlpha: 37,
      panelBorderColor: isNight
        ? toCssColor(p.border, '#9CB09D')
        : mixHex(toCssColor(p.primary, '#C3A37C'), '#FFFFFF', 0.55),
      primaryColor: toCssColor(p.primary, isNight ? '#9CB09D' : '#8A9E8B'),
      tabBackgroundColor: toCssColor(p.card, isNight ? '#2C343A' : '#FFFFFF'),
      themeName: name,
      titleFontColor: isNight ? toCssColor(p.foreground, '#E8E4DE') : '#000000',
      titleFontPath: fontName || '',
      transparentNavBar: true,
      uiCornerReplyFollow: true,
      uiCornerScale: 1.0,
      uiCornerSearchFollow: true,
      uiFontColor: isNight ? toCssColor(p.foreground, '#E8E4DE') : '#000000',
      uiFontPath: fontName || '',
      uiLayoutAlpha: layoutAlpha
    };
  }

  function buildArchiveTopBarConfig(d, isNight, name) {
    const p = isNight ? {
      primary: d.primaryColorDark, background: d.backgroundColorDark
    } : {
      primary: d.primaryColor, background: d.backgroundColor
    };
    return {
      backgroundColor: hexToArgbInt(toCssColor(p.background, isNight ? '#1E2428' : '#F4F1EC')),
      cornerScale: 1.0,
      expandFiltersByDefault: false,
      hideFilterToggleWhenExpanded: false,
      isNightMode: !!isNight,
      name,
      showSearchInDefaultStyle: true,
      style: 'regular',
      tagBarAlpha: 0,
      tagBarColor: hexToArgbInt(toCssColor(p.primary, '#8A9E8B')),
      tagSelectedAlpha: 45,
      tagSelectedColor: -1,
      updatedAt: Date.now(),
      wallpaperAlpha: 0
    };
  }

  async function generateArchiveUiBlob(uiItem) {
    const d = uiItem && uiItem.parsedUi;
    if (!d) return null;
    const name = getItemExportName(uiItem);
    const dir = safeTargetName(name);
    const nightDir = safeTargetName(`${dir} 夜间`);
    const root = new JSZip();
    const components = [];
    const binding = { floatingBottomBarHideSearch: true, preset: 'default' };
    const fontName = d.fontBlob ? 'ui_font.ttf' : '';

    const makeTheme = async isNight => {
      const themeDir = isNight ? nightDir : dir;
      const cfg = buildArchiveThemeConfig(d, isNight, name, null, fontName);
      const bg = isNight ? d.bgDarkBlob : d.bgBlob;
      if (bg) cfg.backgroundImgPath = 'background.jpg';
      const z = new JSZip();
      z.file(`${themeDir}/theme.json`, JSON.stringify({
        config: cfg,
        dirName: themeDir,
        isNightTheme: !!isNight,
        name: isNight ? `${name} 夜间` : name,
        updatedAt: Date.now()
      }, null, 2));
      if (bg) z.file(`${themeDir}/background.jpg`, bg);
      if (fontName && d.fontBlob) z.file(`${themeDir}/${fontName}`, d.fontBlob);
      return await z.generateAsync({ type: 'uint8array' });
    };

    root.file('theme_day.zip', await makeTheme(false));
    components.push({ isNight: false, path: 'theme_day.zip', type: 'THEME' });
    binding.dayTheme = { dirName: dir, name };

    root.file('theme_night.zip', await makeTheme(true));
    components.push({ isNight: true, path: 'theme_night.zip', type: 'THEME' });
    binding.nightTheme = { dirName: nightDir, name: `${name} 夜间` };

    const topDir = safeTargetName(`${dir} 顶栏`);
    const nightTopDir = safeTargetName(`${dir} 夜间顶栏`);
    const makeTopBar = async isNight => {
      const barDir = isNight ? nightTopDir : topDir;
      const z = new JSZip();
      z.file(`${barDir}/top_bar.json`, JSON.stringify(buildArchiveTopBarConfig(d, isNight, isNight ? `${name} 夜间` : name), null, 2));
      return await z.generateAsync({ type: 'uint8array' });
    };
    root.file('top_bar_day.zip', await makeTopBar(false));
    components.push({ isNight: false, path: 'top_bar_day.zip', type: 'TOP_BAR' });
    binding.dayTopBar = { dirName: topDir, name: `${name} 顶栏` };
    root.file('top_bar_night.zip', await makeTopBar(true));
    components.push({ isNight: true, path: 'top_bar_night.zip', type: 'TOP_BAR' });
    binding.nightTopBar = { dirName: nightTopDir, name: `${name} 夜间顶栏` };

    const navDir = safeTargetName(`${dir} 底栏`);
    const navZip = new JSZip();
    const navIcons = {};
    const navMap = [
      ['home', 'home_normal.png'],
      ['bookshelf', 'bookshelf_normal.png'],
      ['explore', 'discovery_normal.png'],
      ['rss', 'rss_normal.png'],
      ['reader', 'readRecord_normal.png'],
      ['my', 'my_normal.png'],
      ['search', 'search_single.png']
    ];
    for (const [sourceKey, fileName] of navMap) {
      const icon = d.navIconsBlobs && d.navIconsBlobs[sourceKey];
      if (!icon || !icon.blob) continue;
      navIcons[fileName.replace('.png', '')] = fileName;
      navZip.file(`${navDir}/${fileName}`, icon.blob);
    }
    const coreNavCount = ['bookshelf_normal', 'discovery_normal', 'rss_normal', 'my_normal'].filter(k => navIcons[k]).length;
    if (coreNavCount >= 3) {
      navZip.file(`${navDir}/navigation.json`, JSON.stringify({
        borderAlpha: 100,
        effectMode: 'glass',
        hideSearchInFloatingStyle: true,
        icons: navIcons,
        isNightMode: false,
        layoutMode: 'floating',
        name,
        opacity: 100,
        sidebarGravity: 'start',
        updatedAt: Date.now()
      }, null, 2));
      root.file('navigation_bar_day.zip', await navZip.generateAsync({ type: 'uint8array' }));
      components.push({ isNight: false, path: 'navigation_bar_day.zip', type: 'NAVIGATION_BAR' });
      binding.dayNavigationBar = { dirName: navDir, name: `${name} 底栏` };
    }

    if (d.coversBlobs && d.coversBlobs.length) {
      const coverDir = dir;
      const coverId = randomId();
      const coverZip = new JSZip();
      const images = [];
      for (let i = 0; i < d.coversBlobs.length; i++) {
        const cover = d.coversBlobs[i];
        if (!cover || !cover.blob) continue;
        const ext = await imageExtension(cover.blob);
        const path = `images/${Date.now()}_${i}.${ext}`;
        coverZip.file(`${coverDir}/${path}`, cover.blob);
        images.push(path);
      }
      if (images.length) {
        coverZip.file(`${coverDir}/collection.json`, JSON.stringify({
          dirName: coverDir,
          id: coverId,
          images,
          isNight: false,
          mode: 'random',
          name,
          updatedAt: Date.now()
        }, null, 2));
        root.file('cover_collection_day.zip', await coverZip.generateAsync({ type: 'uint8array' }));
        components.push({ isNight: false, path: 'cover_collection_day.zip', type: 'COVER_COLLECTION' });
        // Archive binds cover collections by collection id, not by display name.
        binding.dayCoverCollection = { dirName: coverId, name };
      }
    }

    root.file('appearance_kit.json', JSON.stringify({
      binding,
      components,
      exportedAt: Date.now(),
      id: randomId(),
      name,
      version: 1
    }, null, 2));

    return await root.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  function redLayoutMetrics(layout) {
    const l = layout || {};
    const fontSize = Number(l.fontSize) > 0 ? Number(l.fontSize) : 16;
    const headerBottom = Number(l.headerPaddingBottom);
    const headerTop = Number(l.headerPaddingTop);
    const footerTop = Number(l.footerPaddingTop);
    const footerBottom = Number(l.footerPaddingBottom);

    // Header pushed far down: a centered title/cover page with compact text.
    if (headerTop >= 150) {
      return {
        fontSize: Math.round(fontSize + 0.5),
        lineSpacing: Math.max(0, Math.round(Number(l.lineSpacing || 14) - 1)),
        paragraphSpacing: Math.max(0, Math.round(Number(l.paragraphSpacing || 30) / 5)),
        letterSpacing: 0.15,
        paddingTop: Math.max(12, Math.round(fontSize + 1.5)),
        paddingBottom: 10,
        paddingLeft: Math.max(12, Math.round((Number(l.paddingLeft) || 30) - 10)),
        paddingRight: Math.max(12, Math.round((Number(l.paddingRight) || 30) - 10)),
        titleSize: Math.max(10, Math.round(fontSize + 6.5)),
        titleTop: 15,
        titleBottom: 15,
        titleMode: 1,
        titleSegFlag: '[章节]',
        titleLineSpacingExtra: 12,
        titleLineSpacingSub: 0,
        headerTop: Math.round((Number(l.headerPaddingTop) || 180) + 45),
        headerBottom: 0,
        headerLeft: 20,
        headerRight: 20,
        footerTopPad: 6,
        footerBottomPad: 4,
        footerLeft: 16,
        footerRight: 16,
        headerFontSize: 10,
        underlineHeight: 1,
        titleSegScaling: 1.0,
        applyHeaderStyle: false,
        textBold: 500,
        titleBold: 500,
        headerMode: 0,
        shadowRadius: 1.0,
        shadowColor: '#3E3D3B',
        underlineColor: '#FF242424',
        textAccentColor: '#FF5C0000',
        textAccentColorNight: '#FFFE4D55',
        tipHeaderLeft: 1,
        tipHeaderMiddle: 0,
        tipHeaderRight: 9,
        tipFooterLeft: 7,
        tipFooterMiddle: 0,
        tipFooterRight: 6,
        tipHeaderColor: -214,
        tipHeaderColorNight: 0,
        tipFooterColor: -5395200,
        tipFooterColorNight: 0
      };
    }

    // Reeden has two very different page profiles. Small header/footer values
    // are a normal inset page; large header values are a full-bleed artwork page.
    if (!(headerBottom >= 100)) {
      return {
        fontSize: Math.min(18, fontSize + 1),
        lineSpacing: 20,
        paragraphSpacing: 12,
        letterSpacing: 0.082,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 28,
        paddingRight: 28,
        titleSize: 17,
        titleTop: 0,
        titleBottom: 20,
        titleMode: 1,
        headerTop: 70,
        headerBottom: 38,
        headerLeft: 28,
        headerRight: 28,
        footerTopPad: 24,
        footerBottomPad: 13,
        footerLeft: 28,
        footerRight: 28,
        headerFontSize: 10,
        underlineHeight: 2,
        titleSegScaling: 1.2,
        applyHeaderStyle: true,
        textBold: 400,
        titleBold: 0,
        headerMode: 1,
        shadowRadius: 0,
        shadowColor: '#28282A',
        textColor: '#FF000000',
        textColorNight: '#FFB6B6B6',
        tipHeaderLeft: 1,
        tipHeaderMiddle: 0,
        tipHeaderRight: 0,
        tipFooterLeft: 20,
        tipFooterMiddle: 7,
        tipFooterRight: 8
      };
    }

    const lineSpacing = Number(l.lineSpacing) > 0 ? Math.max(0, Number(l.lineSpacing) - 2) : 12;
    const paragraphSpacing = Number(l.paragraphSpacing) > 0
      ? Math.round(Number(l.paragraphSpacing) / Math.max(fontSize, 1) * 3)
      : 2;
    const letterSpacing = Number.isFinite(Number(l.letterSpacing)) && Number(l.letterSpacing) >= 0
      ? Number(l.letterSpacing) / 10
      : 0.1;
    const paddingTop = headerBottom > 0 ? headerBottom : 26;
    const paddingBottom = footerTop + footerBottom > 6
      ? Math.round(footerTop + footerBottom - 6)
      : 19;
    return {
      fontSize,
      lineSpacing,
      paragraphSpacing,
      letterSpacing,
      paddingTop,
      paddingBottom,
      paddingLeft: Math.max(0, (Number(l.paddingLeft) || 21) - 4),
      paddingRight: Number(l.paddingRight) || 16,
      titleSize: Math.max(8, Math.round(fontSize * 1.3)),
      titleTop: Number(l.titleMarginTop) || 0,
      titleBottom: Math.max(0, (Number(l.titlePaddingBottom) || 0) + 9),
      titleMode: 1,
      headerTop: 40,
      headerBottom: 0,
      headerLeft: 6,
      headerRight: 0,
      footerTopPad: 0,
      footerBottomPad: 12,
      footerLeft: 0,
      footerRight: 15,
      headerFontSize: 12,
      underlineHeight: 1,
      titleSegScaling: 1.0,
      applyHeaderStyle: false,
      textBold: 500,
      titleBold: 500,
      headerMode: 0,
      tipHeaderLeft: 1,
      tipHeaderMiddle: 9,
      tipHeaderRight: 0,
      tipFooterLeft: 0,
      tipFooterMiddle: 7,
      tipFooterRight: 11
    };
  }

  // ── Archive (阅读 Archive) reader readConfig ──────────────────────
  function buildArchiveReadConfig(r, name, bgFilename, bgDarkFilename) {
    const src = r.readConfig || {};
    const l = r.layoutConfig || {};
    const red = r.sourceFormat === 'reeden' ? redLayoutMetrics(l) : null;
    return {
      bgAlpha: 100,
      bgStr: bgFilename || '',
      bgStrEInk: '#FFFFFF',
      bgStrNight: bgDarkFilename || '#000000',
      bgType: bgFilename ? 2 : 0,
      bgTypeEInk: 0,
      bgTypeNight: bgDarkFilename ? 2 : 0,
      darkStatusIcon: true,
      darkStatusIconEInk: true,
      darkStatusIconNight: false,
      footerMode: Number(src.footerMode ?? 0),
      footerPaddingBottom: Number(src.footerPaddingBottom ?? 12),
      footerPaddingLeft: Number(src.footerPaddingLeft ?? 19),
      footerPaddingRight: Number(src.footerPaddingRight ?? 25),
      footerPaddingTop: Number(src.footerPaddingTop ?? 6),
      headerMode: red ? 1 : Number(src.headerMode ?? 0),
      headerPaddingBottom: Number(src.headerPaddingBottom ?? 0),
      headerPaddingLeft: Number(src.headerPaddingLeft ?? 16),
      headerPaddingRight: Number(src.headerPaddingRight ?? 16),
      headerPaddingTop: Number(src.headerPaddingTop ?? 16),
      letterSpacing: red ? red.letterSpacing : nonNegative(src.letterSpacing ?? l.letterSpacing, 0.1),
      lineSpacingExtra: red ? red.lineSpacing : nonNegative(src.lineSpacingExtra ?? l.lineSpacing, 12),
      name,
      paddingBottom: red ? red.paddingBottom : nonNegative(src.paddingBottom ?? l.paddingBottom, 19),
      paddingLeft: red ? red.paddingLeft : nonNegative(src.paddingLeft ?? l.paddingLeft, 16),
      paddingRight: red ? red.paddingRight : nonNegative(src.paddingRight ?? l.paddingRight, 16),
      // Archive reserves a 26px status/top inset before the content padding.
      paddingTop: red ? red.paddingTop + 26 : nonNegative(src.paddingTop ?? l.paddingTop, 37) + 26,
      pageAnim: Number(src.pageAnim ?? 2),
      pageAnimEInk: 4,
      paperEffect: false,
      paperInkStrength: 0,
      paragraphIndent: legadoParagraphIndent(src.paragraphIndent || l.paragraphIndent),
      paragraphSpacing: red ? red.paragraphSpacing : nonNegative(src.paragraphSpacing ?? l.paragraphSpacing, 2),
      readScrollFollowBackground: false,
      readScrollFollowBackgroundEInk: false,
      readScrollFollowBackgroundNight: false,
      showFooterLine: false,
      showHeaderLine: false,
      textAccentColor: toArgbHex(r.primaryColor || src.textAccentColor, '#FF834E00'),
      textAccentColorEInk: '#000000',
      textAccentColorNight: toArgbHex(r.primaryColorNight || src.textAccentColorNight, '#FFFE4D55'),
      textBold: Number(src.textBold ?? 500),
      textColor: toArgbHex(r.textColor || src.textColor, '#FF2B241B'),
      textColorEInk: '#000000',
      textColorNight: toArgbHex(r.textColorNight || src.textColorNight, '#FFADADAD'),
      textFont: '',
      textSize: red ? red.fontSize : Number(src.textSize ?? l.fontSize ?? 16),
      tipColor: 0,
      tipDividerColor: -1,
      tipFooterLeft: 7,
      tipFooterMiddle: 0,
      tipFooterRight: 6,
      tipHeaderLeft: 0,
      tipHeaderMiddle: 0,
      tipHeaderRight: 0,
      titleBottomSpacing: red ? red.titleBottom : nonNegative(src.titleBottomSpacing ?? l.titleBottomSpacing, 26),
      titleMode: red ? red.titleMode : ([0, 1, 2].includes(Number(src.titleMode)) ? Number(src.titleMode) : 1),
      titleSize: red ? red.titleSize : (() => {
        const value = Number(src.titleSize ?? l.titleSize);
        return Number.isFinite(value) && value >= 8 && value <= 60 ? value : 22;
      })(),
      titleTopSpacing: red ? red.titleTop : nonNegative(src.titleTopSpacing ?? l.titleTopSpacing, 0),
      underlineDashLength: 6.0,
      underlineMode: 0,
      underlineStrokeWidth: 1.0
    };
  }

  async function generateArchiveReaderBlob(readerItem) {
    const r = readerItem && readerItem.parsedReader;
    if (!r) return null;
    const name = getItemExportName(readerItem);
    const zip = new JSZip();
    let bgFilename = '';
    let bgDarkFilename = '';
    if (r.bgBlob) {
      bgFilename = await imageFileName(r.bgBlob, 'bg');
      zip.file(bgFilename, r.bgBlob);
    }
    if (r.bgDarkBlob) {
      bgDarkFilename = await imageFileName(r.bgDarkBlob, 'bg_night');
      zip.file(bgDarkFilename, r.bgDarkBlob);
    }
    let cfg;
    if (r.sourceFormat === 'archive' && r.readConfig) {
      cfg = { ...r.readConfig, name };
      if (bgFilename) {
        cfg.bgStr = bgFilename;
        cfg.bgType = 2;
      }
      if (bgDarkFilename) {
        cfg.bgStrNight = bgDarkFilename;
        cfg.bgTypeNight = 2;
      }
    } else {
      cfg = buildArchiveReadConfig(r, name, bgFilename, bgDarkFilename);
    }
    zip.file('readConfig.json', JSON.stringify(cfg, null, 2));
    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  // ── Reeden (.red) native package ────────────────────────────────
  function buildReedenThemeJson(d, name, ids) {
    const p = d ? {
      primary: d.primaryColor,
      background: d.backgroundColor,
      card: d.cardColor,
      foreground: d.foregroundColor,
      muted: d.mutedColor,
      border: d.borderColor,
      accent: d.accentColor,
      tab: d.tabColor,
      shelf: d.shelfColor,
      primaryDark: d.primaryColorDark,
      backgroundDark: d.backgroundColorDark,
      cardDark: d.cardColorDark,
      foregroundDark: d.foregroundColorDark,
      mutedDark: d.mutedColorDark,
      borderDark: d.borderColorDark,
      accentDark: d.accentColorDark
    } : {
      primary: '#8A9E8B', background: '#F4F1EC', card: '#FFFFFF', foreground: '#2C2A27',
      muted: '#968E84', border: '#C3A37C', accent: '#8A9E8B', tab: '#FFFFFF', shelf: '#8A9E8B',
      primaryDark: '#9CB09D', backgroundDark: '#1E2428', cardDark: '#2C343A', foregroundDark: '#E8E4DE',
      mutedDark: '#B0A89E', borderDark: '#9CB09D', accentDark: '#9CB09D'
    };
    const light = {
      primaryColor: toArgbHex(p.primary),
      backgroundColor: toArgbHex(p.background),
      foregroundColor: toArgbHex(p.foreground),
      mutedForegroundColor: toArgbHex(p.muted),
      cardColor: toArgbHex(p.card),
      cardForegroundColor: toArgbHex(p.foreground),
      popoverColor: toArgbHex(p.background),
      dialogBackgroundColor: toArgbHex(p.background),
      mutedColor: toArgbHex(p.background),
      borderColor: toArgbHex(p.border),
      inputBorderColor: toArgbHex(p.border),
      accentColor: toArgbHex(p.accent),
      backgroundImage: ids.bgHash,
      coverGalleryId: ids.coverId,
      navbarPackId: ids.navId,
      readerColorSchemaId: ids.readerId,
      themeEffectType: 'none',
      searchFieldBorder: true,
      searchFieldBackgroundColor: '#00FFFFFF',
      switchBorder: true,
      tabBorder: true,
      tabBackgroundColor: toArgbHex(p.tab),
      shelfColor: toArgbHex(p.shelf),
      backgroundImageFit: 'fill',
      cardBackgroundImageFit: 'cover',
      cardRadius: 0.75,
      author: 'Morandi Studio'
    };
    const dark = {
      primaryColor: toArgbHex(p.primaryDark),
      backgroundColor: toArgbHex(p.backgroundDark),
      foregroundColor: toArgbHex(p.foregroundDark),
      mutedForegroundColor: toArgbHex(p.mutedDark),
      cardColor: toArgbHex(p.cardDark),
      cardForegroundColor: toArgbHex(p.foregroundDark),
      popoverColor: toArgbHex(p.backgroundDark),
      mutedColor: toArgbHex(p.cardDark),
      borderColor: toArgbHex(p.borderDark),
      accentColor: toArgbHex(p.accentDark),
      coverGalleryId: ids.coverId,
      navbarPackId: ids.navId,
      readerColorSchemaId: ids.readerDarkId || '',
      author: 'Morandi Studio'
    };
    if (ids.bgHashDark) dark.backgroundImage = ids.bgHashDark;
    return { name, light, dark };
  }

  function buildReedenSchema(r, name, bgHash, night = false) {
    const l = r && r.layoutConfig ? r.layoutConfig : {};
    // Reeden uses -1 / "defaults" for its own automatic spacing. Copying
    // MD3/Archive numeric spacing here makes the reader look completely wrong.
    const layout = {
      ...REEDEN_LAYOUT_DEFAULTS,
      fontSize: Number(l.fontSize ?? 16),
      lineSpacing: -1,
      paragraphSpacing: -1,
      letterSpacing: -1,
      paragraphIndent: 'defaults',
      paddingLeft: 21,
      paddingRight: 21,
      titlePaddingBottom: 26,
      titleMarginTop: 1,
      useDarkMode: !!night
    };
    if (!night && r && r.textColorNight) {
      layout.darkColorSchema = {
        id: randomId(),
        name: `${name} 夜间`,
        backgroundColor: toArgbHex(r.backgroundColorNight),
        textColor: toArgbHex(r.textColorNight),
        primaryColor: toArgbHex(r.primaryColorNight),
        backgroundImageUrl: bgHash,
        backgroundImageOpacity: 1.0,
        layoutConfig: null,
        statusBarFontColorMode: 0,
        themeMode: 'dark'
      };
    }
    return {
      name,
      backgroundColor: toArgbHex(night ? r?.backgroundColorNight : r?.backgroundColor, night ? '#FF1E2428' : '#FFF4F1EC'),
      textColor: toArgbHex(night ? r?.textColorNight : r?.textColor, night ? '#FFADADAD' : '#FF3E3D3B'),
      primaryColor: toArgbHex(night ? r?.primaryColorNight : r?.primaryColor, night ? '#FF9CB09D' : '#FF8A9E8B'),
      backgroundImageUrl: bgHash,
      backgroundImageOpacity: 1.0,
      backgroundImageFit: 'fill',
      statusBarFontColorMode: 0,
      layoutConfig: JSON.stringify(layout),
      boundHighlightRuleIds: [],
      boundHighlightRules: [],
      themeMode: night ? 'dark' : 'light'
    };
  }

  async function generateReedenBlob(uiItem, readerItem) {
    let d = uiItem && uiItem.parsedUi;
    const r = readerItem && readerItem.parsedReader;
    if (!d && r) {
      d = {
        primaryColor: r.primaryColor,
        primaryColorDark: r.primaryColorNight,
        backgroundColor: r.backgroundColor,
        backgroundColorDark: r.backgroundColorNight,
        cardColor: r.backgroundColor,
        cardColorDark: r.backgroundColorNight,
        foregroundColor: r.textColor,
        foregroundColorDark: r.textColorNight,
        mutedColor: r.textColor,
        mutedColorDark: r.textColorNight,
        borderColor: r.primaryColor,
        borderColorDark: r.primaryColorNight,
        accentColor: r.primaryColor,
        accentColorDark: r.primaryColorNight,
        tabColor: r.backgroundColor,
        tabColorDark: r.backgroundColorNight,
        shelfColor: r.primaryColor,
        shelfColorDark: r.primaryColorNight,
        navIconsBlobs: {},
        coversBlobs: [],
        fontBlob: null
      };
    }
    if (d && d.bgBlob && uiItem && uiItem.sourceFormat === 'md3') {
      const average = await averageImageColor(d.bgBlob);
      if (average) {
        d = { ...d, backgroundColor: average, cardColor: average, tabColor: average };
      }
    }
    const name = getItemExportName(uiItem || readerItem);
    const uiBgBlob = d && d.bgBlob ? d.bgBlob : (r && r.bgBlob ? r.bgBlob : null);
    const uiBgDarkBlob = d && d.bgDarkBlob ? d.bgDarkBlob : null;
    const ids = {
      bgHash: uiBgBlob ? await blobMd5Hex(uiBgBlob) : '',
      bgHashDark: uiBgDarkBlob ? await blobMd5Hex(uiBgDarkBlob) : '',
      navId: d && d.navIconsBlobs && Object.keys(d.navIconsBlobs).length ? randomId() : '',
      coverId: d && d.coversBlobs && d.coversBlobs.length ? randomId() : '',
      readerId: randomId(),
      readerDarkId: randomId()
    };
    const zip = new JSZip();
    let themeJson;
    const rawTheme = uiItem && uiItem.sourceFormat === 'reeden' && d && d.raw && d.raw.reeden ? d.raw.reeden.theme : null;
    if (rawTheme) {
      themeJson = JSON.parse(JSON.stringify(rawTheme));
      themeJson.name = name;
      themeJson.light = themeJson.light || {};
      themeJson.dark = themeJson.dark || {};
      themeJson.light.backgroundImage = ids.bgHash;
      themeJson.light.coverGalleryId = ids.coverId;
      themeJson.light.navbarPackId = ids.navId;
      themeJson.light.readerColorSchemaId = ids.readerId;
      themeJson.dark.backgroundImage = ids.bgHashDark;
      themeJson.dark.coverGalleryId = ids.coverId;
      themeJson.dark.navbarPackId = ids.navId;
      themeJson.dark.readerColorSchemaId = ids.readerDarkId;
    } else {
      themeJson = buildReedenThemeJson(d, name, ids);
    }
    zip.file('theme.json', JSON.stringify(themeJson, null, 2));

    if (d && d.bgBlob) zip.file('light/theme_bg.img', d.bgBlob);
    else if (r && r.bgBlob) zip.file('light/theme_bg.img', r.bgBlob);
    if (d && d.bgDarkBlob) zip.file('dark/theme_bg.img', d.bgDarkBlob);

    if (ids.navId && d) {
      zip.file(`navbar_pack/${ids.navId}/meta.json`, JSON.stringify({ name, matchMode: 'byType' }, null, 2));
      const navMap = [
        ['home', 'home_normal'],
        ['bookshelf', 'bookshelf_normal'],
        ['explore', 'feature_normal'],
        ['rss', 'notes_normal'],
        ['my', 'statistics_normal'],
        ['my', 'settings_normal']
      ];
      for (const [sourceKey, targetName] of navMap) {
        const icon = d.navIconsBlobs && d.navIconsBlobs[sourceKey];
        if (!icon || !icon.blob) continue;
        zip.file(`navbar_pack/${ids.navId}/${targetName}.png`, icon.blob);
        if (icon.selectedBlob) {
          const selectedName = targetName.replace('_normal', '_selected');
          zip.file(`navbar_pack/${ids.navId}/${selectedName}.png`, icon.selectedBlob);
        }
      }
    }

    if (ids.coverId && d && d.coversBlobs.length) {
      zip.file(`cover_gallery/${ids.coverId}/meta.json`, JSON.stringify({ name, transparentOptimization: true }, null, 2));
      for (let i = 0; i < d.coversBlobs.length; i++) {
        const cover = d.coversBlobs[i];
        if (!cover || !cover.blob) continue;
        const ext = await imageExtension(cover.blob);
        zip.file(`cover_gallery/${ids.coverId}/${i + 1}.${ext}`, cover.blob);
      }
    }

    const readerBgHash = r && r.bgBlob ? await blobMd5Hex(r.bgBlob) : '';
    const readerBgDarkHash = r && r.bgDarkBlob ? await blobMd5Hex(r.bgDarkBlob) : '';
    let lightSchema;
    let darkSchema;
    if (r && r.sourceFormat === 'reeden' && r.rawSchema) {
      lightSchema = JSON.parse(JSON.stringify(r.rawSchema));
    } else {
      lightSchema = buildReedenSchema(r, name, readerBgHash, false);
    }
    if (!lightSchema.name) lightSchema.name = name;
    lightSchema.backgroundImageUrl = readerBgHash;

    if (r && r.sourceFormat === 'reeden' && r.darkSchema) {
      darkSchema = JSON.parse(JSON.stringify(r.darkSchema));
    } else {
      darkSchema = buildReedenSchema(r, name, readerBgDarkHash || readerBgHash, true);
    }
    if (!darkSchema.name) darkSchema.name = name;
    darkSchema.backgroundImageUrl = readerBgDarkHash || readerBgHash;

    zip.file(`reader_schema/${ids.readerId}/schema.json`, JSON.stringify(lightSchema, null, 2));
    zip.file(`reader_schema/${ids.readerDarkId}/schema.json`, JSON.stringify(darkSchema, null, 2));
    if (r && r.bgBlob) {
      zip.file(`reader_schema/${ids.readerId}/bg.img`, r.bgBlob);
    }
    if (r && r.bgDarkBlob) {
      zip.file(`reader_schema/${ids.readerDarkId}/bg.img`, r.bgDarkBlob);
    }

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    const zipBytes = new Uint8Array(await zipBlob.arrayBuffer());
    const out = new Uint8Array(zipBytes.length + 4);
    out.set([0x52, 0x45, 0x44, 0x04], 0);
    out.set(zipBytes, 4);
    return new Blob([out], { type: 'application/octet-stream' });
  }

  // ── Target dispatcher ────────────────────────────────────────────
  function buildExportFilename(name, format, mode = 'full') {
    const base = safeTargetName(name);
    const meta = FORMAT_META[format] || FORMAT_META.md3;
    if (format === 'reeden') return `${base}_Reeden.red`;
    if (mode === 'ui') return `${base}_${meta.label}主题.zip`;
    if (mode === 'reader') return `${base}_${meta.label}排版.zip`;
    return `${base}_${meta.label}.zip`;
  }

  async function generateTargetBlob(format, mode, pair) {
    if (!pair) return null;
    if (format === 'reeden') return generateReedenBlob(pair.ui, pair.reader);
    if (format === 'archive') {
      if (mode === 'ui') return generateArchiveUiBlob(pair.ui);
      if (mode === 'reader') return generateArchiveReaderBlob(pair.reader);
      return null;
    }
    if (mode === 'ui') return generateMd3UiBlob(pair.ui);
    if (mode === 'reader') return generateMd3ReaderBlob(pair.reader);
    return null;
  }

  async function exportSources(activeItem, mode = 'full') {
    const format = FORMAT_META[state.exportFormat] ? state.exportFormat : 'md3';
    const pair = format === 'reeden' ? getReedenPair(activeItem) : resolveSourcePair(activeItem);
    const name = getItemExportName(activeItem) || getItemExportName(pair.ui) || getItemExportName(pair.reader);
    const results = [];

    if (format === 'reeden') {
      if (!pair.ui || !pair.reader) return results;
      const blob = await generateReedenBlob(pair.ui, pair.reader);
      if (!blob) return results;
      const filename = buildExportFilename(name, format, 'full');
      downloadBlob(blob, filename, blob.size);
      results.push({ blob, filename });
      return results;
    }

    const jobs = [];
    if ((mode === 'full' || mode === 'ui') && pair.ui) jobs.push('ui');
    if ((mode === 'full' || mode === 'reader') && pair.reader) jobs.push('reader');
    for (const job of jobs) {
      const blob = await generateTargetBlob(format, job, pair);
      if (!blob) continue;
      const filename = buildExportFilename(name, format, job);
      downloadBlob(blob, filename, blob.size);
      results.push({ blob, filename });
    }
    return results;
  }

  function setPrimaryBusy(busy) {
    if (!convertBtn) return;
    convertBtn.classList.toggle('is-loading', busy);
    convertBtn.disabled = busy;
    const icon = convertBtn.querySelector('.btn-convert-icon i');
    if (icon) icon.className = busy ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-box-archive';
    if (busy) {
      const target = FORMAT_META[state.exportFormat] || FORMAT_META.md3;
      if (archivePrimaryLabel) archivePrimaryLabel.textContent = `正在生成 ${target.label} 包…`;
      if (archivePrimarySub) archivePrimarySub.textContent = target.note;
    } else {
      updateExportPanel();
    }
  }

  // ── Convert & Export Actions ──────────────────────────────────────
  function setRowBusy(btn, busy) {
    if (!btn) return;
    btn.disabled = busy;
    btn.classList.toggle('is-loading', busy);
    btn.innerHTML = busy
      ? '<i class="fa-solid fa-spinner fa-spin"></i><span>打包</span>'
      : '<i class="fa-solid fa-arrow-down"></i><span>导出</span>';
  }

  convertBtn.addEventListener('click', async () => {
    if (!state.queue.length) return;
    const activeItem = state.queue.find(q => q.id === state.activeId) || state.queue[0];
    if (!activeItem) return;

    setPrimaryBusy(true);
    try {
      const results = await exportSources(activeItem, 'full');
      if (!results.length) throw new Error('No exportable module');
      activeItem.status = 'done';
      showExportTip(results);
    } catch (err) {
      console.error('[Export error]', err);
      activeItem.status = 'error';
    } finally {
      setPrimaryBusy(false);
      renderQueue();
    }
  });

  exportUiBtn.addEventListener('click', async () => {
    const activeItem = state.queue.find(q => q.id === state.activeId);
    if (!activeItem) return;

    setRowBusy(exportUiBtn, true);
    try {
      const results = await exportSources(activeItem, 'ui');
      if (!results.length) throw new Error('No UI module');
      activeItem.status = 'done';
      showExportTip(results);
    } catch (err) {
      console.error('[exportUiBtn error]', err);
    } finally {
      setRowBusy(exportUiBtn, false);
      updateExportPanel();
      renderQueue();
    }
  });

  if (themeNameInput) {
    themeNameInput.addEventListener('input', () => saveCacheState());
  }

  exportReaderBtn.addEventListener('click', async () => {
    const activeItem = state.queue.find(q => q.id === state.activeId);
    if (!activeItem) return;

    setRowBusy(exportReaderBtn, true);
    try {
      const results = await exportSources(activeItem, 'reader');
      if (!results.length) throw new Error('No typography module');
      activeItem.status = 'done';
      showExportTip(results);
    } catch (err) {
      console.error('[exportReaderBtn error]', err);
    } finally {
      setRowBusy(exportReaderBtn, false);
      updateExportPanel();
      renderQueue();
    }
  });

  const batchModeGroup = $('batchModeGroup');
  if (batchModeGroup) {
    batchModeGroup.querySelectorAll('.batch-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        batchModeGroup.querySelectorAll('.batch-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.batchMode = btn.dataset.mode || 'full';
        renderQueue();
      });
    });
  }

  const batchExportBtn = $('batchExportBtn');
  const batchExportLabel = $('batchExportLabel');
  if (batchExportBtn) {
    batchExportBtn.addEventListener('click', async () => {
      const mode = state.batchMode || 'full';
      const format = FORMAT_META[state.exportFormat] ? state.exportFormat : 'md3';
      const meta = FORMAT_META[format];
      const seen = new Set();
      const itemsToExport = state.queue.filter(q => {
        if (mode === 'ui' && !q.hasUi) return false;
        if (mode === 'reader' && !q.hasReader) return false;
        if (mode === 'full' && !q.hasUi && !q.hasReader) return false;
        const key = `${themeBaseKey(q.name) || q.name}|${q.sourceFormat || ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (!itemsToExport.length) return;

      batchExportBtn.disabled = true;
      let count = 0;
      const masterZip = new JSZip();
      const modeName = mode === 'ui' ? '仅主题' : mode === 'reader' ? '仅排版' : '全套';
      const added = [];

      for (const item of itemsToExport) {
        count++;
        if (batchExportLabel) {
          batchExportLabel.textContent = `正在批量导出 (${count}/${itemsToExport.length})…`;
        }
        try {
          const pair = resolveSourcePair(item);
          const name = getItemExportName(item);
          const jobs = format === 'reeden'
            ? ['full']
            : (mode === 'ui' ? ['ui'] : mode === 'reader' ? ['reader'] : ['ui', 'reader']);
          for (const job of jobs) {
            const blob = await generateTargetBlob(format, job, pair);
            if (!blob) continue;
            const filename = buildExportFilename(name, format, job);
            let entryName = filename;
            let dup = 2;
            while (masterZip.file(entryName)) {
              entryName = filename.replace(/(\.[^.]+)$/, ` (${dup++})$1`);
            }
            masterZip.file(entryName, blob);
            added.push(entryName);
          }
          item.status = 'done';
        } catch (err) {
          console.error('[Batch Export Error]', item.name, err);
          item.status = 'error';
        }
      }

      try {
        const masterName = `${meta.label}_批量合集_${modeName}(${itemsToExport.length}个主题).zip`;
        masterZip.file('batch.json', JSON.stringify({
          format: `${format}.batch`,
          createdAt: new Date().toISOString(),
          mode,
          count: itemsToExport.length,
          files: added
        }, null, 2));
        const masterBlob = await masterZip.generateAsync({ type: 'blob' });
        downloadBlob(masterBlob, masterName, masterBlob.size);
      } catch(e){
        console.error('[Master Zip Error]', e);
      }

      batchExportBtn.disabled = false;
      renderQueue();

      const tipBox = $('importTipBox');
      if (tipBox) {
        tipBox.style.display = 'block';
        tipBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> <b>批量导出完成！</b><br>已将 ${itemsToExport.length} 个主题导出为 ${meta.label} 原生包，并收进<b>【${meta.label}_批量合集.zip】</b>，共 ${added.length} 个文件。`;
      }
    });
  }

  function wakeLegadoApp(targetType = 'all') {
    const tipBox = $('importTipBox');
    if (tipBox) tipBox.style.display = 'block';

    const activeItem = state.queue.find(q => q.id === state.activeId);
    if (targetType === 'all' && activeItem) {
      if (activeItem.hasReader && !activeItem.hasUi) targetType = 'reader';
      else if (activeItem.hasUi && !activeItem.hasReader) targetType = 'ui';
    }

    const schemes = [];
    if (targetType === 'ui') {
      schemes.push(
        'legado://import/theme',
        'legado://theme/import',
        'intent://import/theme#Intent;scheme=legado;package=io.legado.app.md3;end',
        'intent://import/theme#Intent;scheme=legado;package=com.gedoor.app.book;end',
        'legado://import/online',
        'legado://'
      );
    } else if (targetType === 'reader') {
      schemes.push(
        'legado://import/readConfig',
        'legado://readConfig/import',
        'intent://import/readConfig#Intent;scheme=legado;package=io.legado.app.md3;end',
        'intent://import/readConfig#Intent;scheme=legado;package=com.gedoor.app.book;end',
        'legado://import/online',
        'legado://'
      );
    } else {
      schemes.push(
        'legado://import/theme',
        'legado://import/readConfig',
        'legado://import/online',
        'intent://import/online#Intent;scheme=legado;package=io.legado.app.md3;end',
        'legado://'
      );
    }

    let idx = 0;
    function tryNext() {
      if (idx < schemes.length) {
        window.location.href = schemes[idx++];
        setTimeout(tryNext, 350);
      }
    }
    tryNext();
  }

  const wakeAppBtn = $('wakeAppBtn');
  if (wakeAppBtn) {
    wakeAppBtn.addEventListener('click', () => {
      wakeLegadoApp('all');
    });
  }

  function themeBaseKey(name) {
    return String(name || '')
      .replace(/\.(red|zip|rgshare|rgtheme|rg)$/i, '')
      .replace(/(MD3|Archive|arc|Reeden|reader|应用主题|主题包|主题美化|排版美化|主题|排版|美化|全套|converted)/gi, '')
      .replace(/[\s_\-·.()（）]+/g, '')
      .trim();
  }

  function resolveSourcePair(item) {
    if (!item) return { ui: null, reader: null };
    const base = themeBaseKey(item.name);
    const pick = key => {
      if (item[key]) return item;
      const candidates = state.queue.filter(q => q.id !== item.id && q[key]);
      if (!candidates.length) return null;
      const sameFormat = candidates.filter(q => q.sourceFormat && item.sourceFormat && q.sourceFormat === item.sourceFormat);
      const pool = sameFormat.length ? sameFormat : candidates;
      const exact = pool.find(q => themeBaseKey(q.name) === base);
      if (exact) return exact;
      const fuzzy = pool.find(q => {
        const other = themeBaseKey(q.name);
        return other && base && (base.includes(other) || other.includes(base));
      });
      return fuzzy || pool[0];
    };
    return {
      ui: pick('hasUi'),
      reader: pick('hasReader')
    };
  }

  function getItemExportName(item) {
    if (!item) return '美化主题';
    if (item.customName && item.customName.trim()) {
      return item.customName.trim();
    }
    if (item.id === state.activeId && themeNameInput && themeNameInput.value.trim()) {
      return themeNameInput.value.trim();
    }
    if (item.parsedUi && item.parsedUi.name) return item.parsedUi.name;
    if (item.parsedReader && item.parsedReader.name) return item.parsedReader.name;
    return item.name ? item.name.replace(/\.(red|zip|rgshare|rgtheme|rg)$/i, '') : '美化主题';
  }

  // Generate MD3 App UI Theme Blob
  async function generateMd3UiBlob(item) {
    const d         = item.parsedUi;
    if (!d) return null;

    const zip       = new JSZip();
    const name      = getItemExportName(item);
    const assetsMap = {};

    if (d.bgBlob) {
      zip.file('assets/background/light.jpg', d.bgBlob);
      assetsMap['background.light'] = 'assets/background/light.jpg';
    }
    if (d.bgDarkBlob) {
      zip.file('assets/background/dark.jpg', d.bgDarkBlob);
      assetsMap['background.dark'] = 'assets/background/dark.jpg';
    }

    if (d.navIconsBlobs) {
      Object.keys(d.navIconsBlobs).forEach(key => {
        const iconObj = d.navIconsBlobs[key];
        if (iconObj) {
          if (iconObj.blob) {
            const p = `assets/navigation/${key}.png`;
            zip.file(p, iconObj.blob);
            assetsMap[`navigation.${key}`] = p;
          }
          if (iconObj.selectedBlob) {
            const p = `assets/navigation/${key}-selected.png`;
            zip.file(p, iconObj.selectedBlob);
            assetsMap[`navigation.${key}.selected`] = p;
          } else if (iconObj.blob) {
            assetsMap[`navigation.${key}.selected`] = `assets/navigation/${key}.png`;
          }
        }
      });
    }

    if (d.navIconsDarkBlobs) {
      Object.keys(d.navIconsDarkBlobs).forEach(key => {
        const iconObj = d.navIconsDarkBlobs[key];
        if (iconObj) {
          if (iconObj.blob) {
            const p = `assets/navigation/dark/${key}.png`;
            zip.file(p, iconObj.blob);
            assetsMap[`navigation.${key}.dark`] = p;
            assetsMap[`navigation.${key}.night`] = p;
          }
          if (iconObj.selectedBlob) {
            const p = `assets/navigation/dark/${key}-selected.png`;
            zip.file(p, iconObj.selectedBlob);
            assetsMap[`navigation.${key}.selected.dark`] = p;
            assetsMap[`navigation.${key}.selected.night`] = p;
          } else if (iconObj.blob) {
            assetsMap[`navigation.${key}.selected.dark`] = `assets/navigation/dark/${key}.png`;
            assetsMap[`navigation.${key}.selected.night`] = `assets/navigation/dark/${key}.png`;
          }
        }
      });
    }

    if (d.fontBlob) {
      zip.file('assets/fonts/app.ttf', d.fontBlob);
      assetsMap['font.app'] = 'assets/fonts/app.ttf';
    }

    const coverAlbums = [];
    if ((d.coversBlobs && d.coversBlobs.length) || (d.coversDarkBlobs && d.coversDarkBlobs.length)) {
      const lightImages = [];
      const darkImages = [];

      if (d.coversBlobs) {
        for (let i = 0; i < d.coversBlobs.length; i++) {
          const c = d.coversBlobs[i];
          if (c && c.blob) {
            const ext = await imageExtension(c.blob);
            const p = `cover-albums/album_0/light/image_${i}.${ext}`;
            zip.file(p, c.blob);
            lightImages.push({ path: p });
          }
        }
      }

      // MD3 ships a dark cover set as well. Mirror the light set only when the
      // source theme actually declares a dark cover gallery.
      const darkCovers = (d.coversDarkBlobs && d.coversDarkBlobs.length)
        ? d.coversDarkBlobs
        : (d.raw && d.raw.reeden && d.raw.reeden.theme && d.raw.reeden.theme.dark && d.raw.reeden.theme.dark.coverGalleryId
          ? (d.coversBlobs || [])
          : []);
      for (let i = 0; i < darkCovers.length; i++) {
        const c = darkCovers[i];
        if (c && c.blob) {
          const ext = await imageExtension(c.blob);
          const p = `cover-albums/album_0/dark/image_${i}.${ext}`;
          zip.file(p, c.blob);
          darkImages.push({ path: p });
        }
      }

      if (lightImages.length || darkImages.length) {
        coverAlbums.push({ darkImages, lightImages, name, ref: 'album_0' });
      }
    }

    const manifest = {
      assets: assetsMap,
      config: buildUiConfig(d, name),
      coverAlbums,
      coverSelection: coverAlbums.length ? { albumRef: 'album_0' } : {},
      formatVersion: 1,
      name
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  }

  // Generate MD3 Reader Typesetting Theme Blob
  async function generateMd3ReaderBlob(item) {
    const r = item.parsedReader;
    if (!r) return null;

    const zip = new JSZip();
    const name = getItemExportName(item);
    let bgFilename = '';
    let bgDarkFilename = '';

    if (r.bgBlob) {
      bgFilename = await imageFileName(r.bgBlob, 'bg');
      zip.file(bgFilename, r.bgBlob);
    }
    if (r.bgDarkBlob) {
      bgDarkFilename = await imageFileName(r.bgDarkBlob, 'bg_night');
      zip.file(bgDarkFilename, r.bgDarkBlob);
    }

    if (r.extraFiles) {
      Object.keys(r.extraFiles).forEach(fn => {
        const fileContent = r.extraFiles[fn];
        if (fileContent && (fileContent instanceof Blob || fileContent instanceof ArrayBuffer || typeof fileContent === 'string')) {
          zip.file(fn, fileContent);
        }
      });
    }

    // Auto-bind extracted font file to textFont and titleFont if not set
    let detectedFont = '';
    if (r.extraFiles) {
      detectedFont = Object.keys(r.extraFiles).find(fn => /\.(ttf|otf)$/i.test(fn)) || '';
    }

    if (r.sourceFormat === 'md3' && r.readConfig) {
      const cfg = { ...r.readConfig, name };
      if (bgFilename) {
        cfg.bgStr = bgFilename;
        cfg.bgType = 2;
      }
      if (bgDarkFilename) {
        cfg.bgStrNight = bgDarkFilename;
        cfg.bgTypeNight = 2;
      }
      zip.file('readConfig.json', JSON.stringify(cfg, null, 2));
      return await zip.generateAsync({ type: 'blob' });
    }

    const l = r.layoutConfig || {};
    const src = r.readConfig || {};
    const defaults = {
      "applyHeaderStyle": true,
      "bgAlpha": 100,
      "bgStr": "",
      "bgStrEInk": "#FFFFFF",
      "bgStrNight": "#000000",
      "bgType": 0,
      "bgTypeEInk": 0,
      "bgTypeNight": 0,
      "customTipFooterLeft": "",
      "customTipFooterMiddle": "",
      "customTipFooterRight": "",
      "customTipHeaderLeft": "",
      "customTipHeaderMiddle": "",
      "customTipHeaderRight": "",
      "darkStatusIcon": true,
      "darkStatusIconEInk": true,
      "darkStatusIconNight": false,
      "dottedBase": 6.0,
      "dottedLine": true,
      "dottedRatio": 6.0,
      "footerFont": "",
      "footerFontSize": 12,
      "footerMode": 0,
      "footerPaddingBottom": parseInt(l.footerPaddingBottom || 14),
      "footerPaddingLeft": parseInt(l.footerPaddingLeft || 21),
      "footerPaddingRight": parseInt(l.footerPaddingRight || 20),
      "footerPaddingTop": parseInt(l.footerPaddingTop || 0),
      "headerFont": "",
      "headerFontSize": 13,
      "headerMode": 0,
      "headerPaddingBottom": parseInt(l.headerPaddingBottom || 0),
      "headerPaddingLeft": parseInt(l.headerPaddingLeft || 29),
      "headerPaddingRight": parseInt(l.headerPaddingRight || 7),
      "headerPaddingTop": parseInt(l.headerPaddingTop || 64),
      "highlightRules": [],
      "letterSpacing": parseFloat(l.letterSpacing ?? 0.1),
      "lineSpacingExtra": parseInt(l.lineSpacing ?? 16),
      "name": name,
      "paddingBottom": parseInt(l.paddingBottom ?? 17),
      "paddingLeft": parseInt(l.paddingLeft ?? 30),
      "paddingRight": parseInt(l.paddingRight ?? 30),
      "paddingTop": parseInt(l.paddingTop ?? 26),
      "pageAnim": 0,
      "pageAnimEInk": 4,
      "paragraphIndent": "　",
      "paragraphSpacing": parseInt(l.paragraphSpacing ?? 2),
      "shadowColor": "#3E3D3B",
      "shadowColorN": "#3E3D3B",
      "shadowDx": 1.0,
      "shadowDy": 1.0,
      "shadowRadius": 16.0,
      "showFooterLine": false,
      "showHeaderLine": false,
      "textAccentColor": "#834E00",
      "textAccentColorEInk": "#000000",
      "textAccentColorNight": "#FE4D55",
      "textBold": 0,
      "textColor": r.textColor || "#3E3D3B",
      "textColorEInk": "#000000",
      "textColorNight": "#ADADAD",
      "textFont": detectedFont || "",
      "textItalic": false,
      "textShadow": false,
      "textSize": parseInt(l.fontSize ?? 16),
      "tipDividerColor": -1,
      "tipFooterColor": 0,
      "tipFooterColorNight": 0,
      "tipFooterLeft": 7,
      "tipFooterMiddle": 0,
      "tipFooterRight": 6,
      "tipHeaderColor": -1,
      "tipHeaderColorNight": 0,
      "tipHeaderLeft": 1,
      "tipHeaderMiddle": 0,
      "tipHeaderRight": 0,
      "titleBold": 500,
      "titleBottomSpacing": parseInt(l.titleBottomSpacing ?? l.titlePaddingBottom ?? 28),
      "titleColor": 0,
      "titleColorNight": 0,
      "titleFont": "",
      "titleLineSpacingExtra": 18,
      "titleLineSpacingSub": -7,
      "titleMode": 0,
      "titleSegDistance": 4,
      "titleSegFlag": "[章节卷]",
      "titleSegScaling": 1.2,
      "titleSegType": 3,
      "titleSize": parseInt(l.titleSize ?? 16),
      "titleTopSpacing": parseInt(l.titleTopSpacing ?? l.titleMarginTop ?? 0),
      "underline": true,
      "underlineColor": "#3E3D3B",
      "underlineColorNight": "#ADADAD",
      "underlineExtend": false,
      "underlineHeight": 2,
      "underlinePadding": 10
    };

    const readConfig = { ...defaults };
    for (const key of Object.keys(readConfig)) {
      if (src[key] !== undefined) readConfig[key] = src[key];
    }
    readConfig.name = name;
    readConfig.bgStr = bgFilename || (src.bgStr && !/^#/.test(src.bgStr) ? src.bgStr : '');
    readConfig.bgStrNight = bgDarkFilename || (src.bgStrNight && !/^#/.test(src.bgStrNight) ? src.bgStrNight : '#000000');
    readConfig.bgType = bgFilename ? 2 : 0;
    readConfig.bgTypeNight = bgDarkFilename ? 2 : 0;
    readConfig.textColor = toArgbHex(r.textColor || src.textColor, '#FF3E3D3B');
    readConfig.textColorNight = toArgbHex(r.textColorNight || src.textColorNight, '#FFADADAD');
    readConfig.textAccentColor = toArgbHex(r.primaryColor || src.textAccentColor, '#FF834E00');
    readConfig.textAccentColorNight = toArgbHex(r.primaryColorNight || src.textAccentColorNight, '#FFFE4D55');
    readConfig.textSize = parseInt(nonNegative(src.textSize ?? l.fontSize, 16));
    readConfig.lineSpacingExtra = parseInt(nonNegative(src.lineSpacingExtra ?? l.lineSpacing, 12));
    readConfig.paragraphSpacing = parseInt(nonNegative(src.paragraphSpacing ?? l.paragraphSpacing, 2));
    readConfig.paragraphIndent = legadoParagraphIndent(src.paragraphIndent || l.paragraphIndent);
    const sourceTop = Number(src.paddingTop ?? l.paddingTop);
    readConfig.paddingTop = Number.isFinite(sourceTop) && sourceTop > 26
      ? Math.max(0, sourceTop - 26)
      : 26;
    readConfig.paddingBottom = parseInt(src.paddingBottom ?? l.paddingBottom ?? 17);
    readConfig.paddingLeft = parseInt(src.paddingLeft ?? l.paddingLeft ?? 30);
    readConfig.paddingRight = parseInt(src.paddingRight ?? l.paddingRight ?? 30);
    const sourceTitleSize = Number(src.titleSize ?? l.titleSize);
    readConfig.titleSize = Number.isFinite(sourceTitleSize) && sourceTitleSize >= 8
      ? Math.min(sourceTitleSize, 60)
      : 22;
    const sourceTitleMode = Number(src.titleMode ?? l.titleMode);
    readConfig.titleMode = sourceTitleMode === 3
      ? 1
      : ([0, 1, 2].includes(sourceTitleMode) ? sourceTitleMode : 1);
    readConfig.titleBottomSpacing = sourceTitleMode === 3
      ? 49
      : parseInt(nonNegative(src.titleBottomSpacing ?? l.titleBottomSpacing, 49));
    readConfig.titleTopSpacing = parseInt(src.titleTopSpacing ?? l.titleTopSpacing ?? 0);
    readConfig.letterSpacing = nonNegative(src.letterSpacing ?? l.letterSpacing, 0.1);
    readConfig.textFont = detectedFont || src.textFont || '';
    readConfig.titleFont = detectedFont || src.titleFont || '';
    readConfig.highlightRules = Array.isArray(src.highlightRules) ? src.highlightRules : [];
    readConfig.name = name;

    if (r.sourceFormat === 'reeden') {
      const m = redLayoutMetrics(l);
      readConfig.textSize = m.fontSize;
      readConfig.lineSpacingExtra = m.lineSpacing;
      readConfig.paragraphSpacing = m.paragraphSpacing;
      readConfig.letterSpacing = m.letterSpacing;
      readConfig.paddingTop = m.paddingTop;
      readConfig.paddingBottom = m.paddingBottom;
      readConfig.paddingLeft = m.paddingLeft;
      readConfig.paddingRight = m.paddingRight;
      readConfig.titleSize = m.titleSize;
      readConfig.titleMode = m.titleMode;
      readConfig.titleTopSpacing = m.titleTop;
      readConfig.titleBottomSpacing = m.titleBottom;
      readConfig.paragraphIndent = legadoParagraphIndent(l.paragraphIndent);
      if (m.textColor) readConfig.textColor = m.textColor;
      if (m.textColorNight) readConfig.textColorNight = m.textColorNight;
      // MD3's header/footer chrome uses the matching normal / full-bleed profile.
      readConfig.headerPaddingTop = m.headerTop;
      readConfig.headerPaddingBottom = m.headerBottom;
      readConfig.headerPaddingLeft = m.headerLeft;
      readConfig.headerPaddingRight = m.headerRight;
      readConfig.footerPaddingTop = m.footerTopPad;
      readConfig.footerPaddingBottom = m.footerBottomPad;
      readConfig.footerPaddingLeft = m.footerLeft;
      readConfig.footerPaddingRight = m.footerRight;
      readConfig.textBold = m.textBold;
      readConfig.titleBold = m.titleBold;
      readConfig.underlineHeight = m.underlineHeight;
      readConfig.pageAnim = 2;
      readConfig.applyHeaderStyle = m.applyHeaderStyle;
      // Do not point headerFont at an extracted subset: MD3 does not reliably
      // install header fonts from a typography zip, which makes the header vanish.
      readConfig.headerFont = '';
      readConfig.headerFontSize = m.headerFontSize;
      readConfig.footerFontSize = 12;
      readConfig.headerMode = m.headerMode === undefined ? 1 : m.headerMode;
      if (m.shadowRadius !== undefined) readConfig.shadowRadius = m.shadowRadius;
      if (m.shadowColor) {
        readConfig.shadowColor = m.shadowColor;
        readConfig.shadowColorN = m.shadowColor;
      }
      readConfig.textFont = '';
      readConfig.titleFont = '';
      readConfig.titleLineSpacingExtra = m.titleLineSpacingExtra === undefined ? 10 : m.titleLineSpacingExtra;
      readConfig.titleLineSpacingSub = m.titleLineSpacingSub === undefined ? 5 : m.titleLineSpacingSub;
      readConfig.titleSegFlag = m.titleSegFlag || '[章节回]';
      readConfig.titleSegScaling = m.titleSegScaling;
      if (m.underlineColor) readConfig.underlineColor = m.underlineColor;
      if (m.textAccentColor) readConfig.textAccentColor = m.textAccentColor;
      if (m.textAccentColorNight) readConfig.textAccentColorNight = m.textAccentColorNight;
      readConfig.tipFooterColor = m.tipFooterColor === undefined ? 0 : m.tipFooterColor;
      readConfig.tipFooterColorNight = m.tipFooterColorNight === undefined ? -16777216 : m.tipFooterColorNight;
      readConfig.tipFooterLeft = m.tipFooterLeft;
      readConfig.tipFooterMiddle = m.tipFooterMiddle;
      readConfig.tipFooterRight = m.tipFooterRight;
      readConfig.tipHeaderColor = m.tipHeaderColor === undefined ? 0 : m.tipHeaderColor;
      readConfig.tipHeaderColorNight = m.tipHeaderColorNight === undefined ? -16777216 : m.tipHeaderColorNight;
      readConfig.tipHeaderLeft = m.tipHeaderLeft;
      readConfig.tipHeaderMiddle = m.tipHeaderMiddle;
      readConfig.tipHeaderRight = m.tipHeaderRight;
    }

    zip.file('readConfig.json', JSON.stringify(readConfig, null, 2));
    return await zip.generateAsync({ type: 'blob' });
  }


  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function downloadBlob(blob, filename, size) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 600000);
    }, 500);

    addDownloadLinkCard(filename, url, size || blob.size);
  }

  function addDownloadLinkCard(filename, url, size) {
    const box = $('downloadLinksBox');
    const list = $('downloadList');
    if (!box || !list) return;

    box.style.display = 'block';

    const isRed = /\.red$/i.test(filename);
    const isArchive = /_Archive/i.test(filename) || state.exportFormat === 'archive';
    const icon = isRed ? 'fa-book-open' : isArchive ? 'fa-box-archive' : 'fa-file-zipper';
    const packageLabel = isRed ? 'Reeden 主题包' : isArchive ? 'Archive 原生包' : 'MD3 原生包';
    const safeFilename = escapeHtml(filename);
    const card = document.createElement('div');
    card.className = 'download-card';
    card.innerHTML = `
      <span class="dl-icon"><i class="fa-solid ${icon}"></i></span>
      <div class="dl-info">
        <div class="dl-name" title="${safeFilename}">${safeFilename}</div>
        <div class="dl-meta">${packageLabel}${size ? ` · ${formatBytes(size)}` : ''}</div>
      </div>
      <a href="${url}" download="${safeFilename}" class="btn-dl-now" title="下载 ${safeFilename}">
        <i class="fa-solid fa-download"></i><span>下载</span>
      </a>
      <a href="${url}" target="_blank" rel="noopener" class="btn-dl-open" title="打开 ${safeFilename}">
        打开
      </a>
      ${typeof navigator.share === 'function' ? '<button type="button" class="btn-dl-open btn-dl-share">分享</button>' : ''}
    `;
    list.prepend(card);
    const shareBtn = card.querySelector('.btn-dl-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        try {
          const blob = await fetch(url).then(response => response.blob());
          const file = new File([blob], filename, { type: blob.type || 'application/zip' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: filename });
          } else {
            window.open(url, '_blank', 'noopener');
          }
        } catch (e) {
          window.open(url, '_blank', 'noopener');
        }
      });
    }
    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
      const controlsTab = document.querySelector('.m-switcher-btn[data-m-tab="controls"]');
      if (controlsTab) controlsTab.click();
      setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
    }
  }

  function showExportTip(result) {
    const tipBox = $('importTipBox');
    if (!tipBox) return;
    const results = Array.isArray(result) ? result : [{ filename: result }];
    const files = results
      .map(item => `<span class="tip-filename">${escapeHtml(item.filename)}</span>`)
      .join('<br>');
    const target = FORMAT_META[state.exportFormat] || FORMAT_META.md3;
    tipBox.style.display = 'block';
    tipBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> <b>已生成 ${target.label} 原生包：</b><br>${files}<br>${target.note}。`;
  }

  const clearDownloadsBtn = $('clearDownloadsBtn');
  if (clearDownloadsBtn) {
    clearDownloadsBtn.addEventListener('click', () => {
      const list = $('downloadList');
      if (list) list.innerHTML = '';
      const box = $('downloadLinksBox');
      if (box) box.style.display = 'none';
    });
  }

  function buildUiConfig(d, name) {
    const rawTheme = d && d.raw && d.raw.reeden ? d.raw.reeden.theme : null;
    const rawLight = rawTheme && rawTheme.light ? rawTheme.light : {};
    const rawDark = rawTheme && rawTheme.dark ? rawTheme.dark : {};
    const rawColor = (rawValue, fallback) => rawValue ? hexToArgbInt(rawValue) : hexToArgbInt(fallback);
    return {
      appColumnBackgroundOpacity: 100,
      appTheme: '12',
      baseCardBorderColor: 0,
      baseCardBorderColorNight: 0,
      baseCardBorderWidth: 1.0,
      baseCardCornerRadius: 16.0,
      bgImageBlurring: 3,
      bgImageNBlurring: 3,
      bookInfoBackgroundBlur: 'on',
      bookInfoDefaultCoverBackground: 'on',
      bookInfoFollowCoverColor: true,
      bookInfoInputColor: 0,
      bookInfoNetworkCoverBackground: 'on',
      bookshelfCardColor: rawColor(rawLight.cardColor, d.cardColor),
      bookshelfCardColorDark: rawColor(rawDark.cardColor, d.cardColorDark),
      bottomBarBlurAlpha: 40,
      bottomBarBlurRadius: 10,
      bottomBarLensRadius: 24.0,
      bottomBarOpacity: 94,
      cNPrimary: hexToArgbInt(d.primaryColorDark),
      cPrimary:  hexToArgbInt(d.primaryColor),
      composeEngine: 'material',
      containerOpacity: 74,
      coverDefaultColor: true,
      coverDefaultImage: '',
      coverDefaultImageDark: '',
      coverInfoOrientation: '0',
      coverLoadOnlyWifi: false,
      coverShadowColor: -16777216,
      coverShadowColorN: -16777216,
      coverShowAuthor: true,
      coverShowAuthorN: true,
      coverShowName: false,
      coverShowNameN: false,
      coverShowShadow: false,
      coverShowStroke: true,
      coverTextColor: -16777216,
      coverTextColorN: -1,
      coverUseDefault: true,
      customTagColorsJson: '[]',
      customContrast: 'Default',
      customMode: 'tonalSpot',
      defaultHomePage: 'bookshelf',
      disableSplicedColumnGroupCornerRadius: true,
      enableBlur: true,
      enableContainerBackgroundImage: !!d.bgBlob,
      enableCustomTagColors: true,
      enableDeepPersonalization: false,
      enableItemDivider: false,
      enableProgressiveBlur: true,
      fontScale: 10,
      glassCardBackgroundOpacity: 74,
      isPredictiveBackEnabled: true,
      isPureBlack: false,
      itemDividerColor: 0,
      itemDividerLength: 80.0,
      itemDividerWidth: 1.0,
      labelContainerColor: 0,
      labelContainerColorNight: 0,
      labelVisibilityMode: 'auto',
      launcherIcon: 'launcherw',
      mainNavigationOrder: 'home,bookshelf,explore,rss,my',
      materialVersion: 'material3',
      mergeTopBarActions: false,
      navIconBookshelf: '',
      navIconBookshelfSelected: '',
      navIconExplore: '',
      navIconExploreSelected: '',
      navIconHome: '',
      navIconHomeSelected: '',
      navIconMy: '',
      navIconMySelected: '',
      navIconRss: '',
      navIconRssSelected: '',
      overrideBaseCardBorder: false,
      overrideBaseCardCornerRadius: true,
      paletteStyle: 'tonalSpot',
      primaryTextColor: readableTextColor(rawLight.foregroundColor, rawLight.backgroundColor || d.backgroundColor, '#000000'),
      primaryTextColorNight: readableTextColor(rawDark.foregroundColor, rawDark.backgroundColor || d.backgroundColorDark, '#FFFFFF'),
      secondaryTextColor: readableTextColor(rawLight.mutedForegroundColor, rawLight.backgroundColor || d.backgroundColor, '#3E3D3B'),
      secondaryTextColorNight: readableTextColor(rawDark.mutedForegroundColor, rawDark.backgroundColor || d.backgroundColorDark, '#B6B6B6'),
      secondaryThemeColor: hexToArgbInt(d.primaryColor),
      secondaryThemeColorNight: hexToArgbInt(d.primaryColorDark),
      selectedCoverAlbumId: '',
      showBottomView: true,
      showDiscovery: true,
      showHome: true,
      showRss: true,
      showStatusBar: true,
      swipeAnimation: true,
      tabletInterface: 'auto',
      themeBackgroundColor: rawColor(rawLight.backgroundColor, d.backgroundColor),
      themeBackgroundColorNight: rawColor(rawDark.backgroundColor, d.backgroundColorDark),
      themeColor: rawColor(rawLight.primaryColor, d.primaryColor),
      themeColorNight: rawColor(rawDark.primaryColor, d.primaryColorDark),
      themeMode: '1',
      topBarBlurAlpha: 73,
      topBarBlurRadius: 29,
      topBarButtonStyle: 'glass',
      topBarOpacity: 100,
      useFlexibleTopAppBar: false,
      useFloatingBottomBar: true,
      useFloatingBottomBarLiquidGlass: true,
      useMiuixMonet: false
    };
  }

});

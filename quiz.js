/* Soft Skills Kids — picture quiz + printable certificate. Data in window.QZ (written by site/quiz.py).
   Nothing is stored or sent: the child's name only lives in this page while the certificate is drawn. */
(function () {
  var C = window.QZ, root = document.getElementById('quiz');
  if (!C || !root) return;
  var T = C.t, $ = function (s) { return root.querySelector(s) };
  var intro = $('.qz-intro'), play = $('.qz-play'), done = $('.qz-done'), cert = $('.qz-cert');
  var canvas = cert.querySelector('canvas'), input = $('.qz-form input');
  var qi = 0, kidName = '';

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x }
    return a;
  }

  function stars() {
    var h = '';
    for (var i = 0; i < C.n; i++) h += '<span class="' + (i < qi ? 'on' : '') + '">★</span>';
    $('.qz-stars').innerHTML = h;
  }

  function burst(el, count) {
    var r = el.getBoundingClientRect(), cols = ['#f5b301', '#ec4899', '#22c55e', '#3b82f6', '#f97316', '#a855f7'];
    for (var i = 0; i < (count || 28); i++) {
      var s = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 160;
      s.className = 'qzc';
      s.style.left = (r.left + r.width / 2) + 'px';
      s.style.top = (r.top + r.height / 2) + 'px';
      s.style.background = cols[i % cols.length];
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      document.body.appendChild(s);
      setTimeout(s.remove.bind(s), 1000);
    }
  }

  function show() {
    var q = C.qs[qi], box = $('.qz-opts'), msg = $('.qz-msg'), locked = false;
    $('.qz-prog').textContent = T.qof.replace('{i}', qi + 1).replace('{n}', C.n);
    stars();
    $('.qz-q').textContent = q.q;
    msg.textContent = ''; msg.className = 'qz-msg';
    box.innerHTML = '';
    shuffle(q.o).forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'qz-opt';
      b.innerHTML = '<img src="' + o.img + '" alt="" width="640" height="480"><span></span>';
      b.querySelector('span').textContent = o.label;
      b.onclick = function () {
        if (locked || b.disabled) return;
        if (o.ok) {
          locked = true;
          b.classList.add('ok');
          msg.textContent = T.right[qi % T.right.length]; msg.className = 'qz-msg ok';
          burst(b);
          qi++; stars();
          setTimeout(function () { qi < C.n ? show() : finish() }, 1500);
        } else {
          b.classList.add('no'); b.disabled = true;
          msg.textContent = T.wrong; msg.className = 'qz-msg no';
        }
      };
      box.appendChild(b);
    });
    var top = play.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.4) play.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function finish() {
    play.hidden = true; done.hidden = false; cert.hidden = true;
    burst($('.qz-done h3'), 60);
    done.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { input.focus({ preventScroll: true }) }, 500);
  }

  function start() {
    qi = 0; intro.hidden = true; done.hidden = true; cert.hidden = true; play.hidden = false;
    input.value = ''; kidName = '';
    show();
  }

  // ------------------------------------------------------------- certificate
  function loadImg(src) {
    return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i) }; i.onerror = function () { res(null) }; i.src = src });
  }
  function rr(x, y, w, h, r) {
    var c = canvas.getContext('2d');
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function star(c, x, y, R, r, n) {
    c.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var a = Math.PI / n * i - Math.PI / 2, d = i % 2 ? r : R;
      c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    c.closePath();
  }
  function fit(c, text, font, size, maxW) {
    do { c.font = font.replace('{s}', size); size -= 2 } while (c.measureText(text).width > maxW && size > 20);
  }
  function caps(t) {  // Greek capitals carry no accents
    return t.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  }
  function isLight(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
  }

  async function draw(name) {
    var c = canvas.getContext('2d'), W = canvas.width, H = canvas.height, NAVY = '#1b2a5c', GOLD = '#f5b301', ACC = C.color;
    var CF = 'Comfortaa, "Segoe UI", system-ui, sans-serif', SF = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    try { await document.fonts.load('700 80px Comfortaa', T.c_title + name + C.skill + 'ΑΩαω') } catch (e) {}
    var logo = await loadImg('/img/logo-512.png'), hero = await loadImg('hero.jpg');

    c.fillStyle = '#fffaf0'; c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,236,200,0.6)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.lineWidth = 26; c.strokeStyle = ACC; rr(40, 40, W - 80, H - 80, 44); c.stroke();
    c.lineWidth = 4; c.strokeStyle = NAVY; rr(84, 84, W - 168, H - 168, 30); c.stroke();
    [[130, 130], [W - 130, 130], [130, H - 130], [W - 130, H - 130]].forEach(function (p) {
      c.fillStyle = GOLD; star(c, p[0], p[1], 34, 15, 5); c.fill();
    });

    // left: picture from the song + gold seal
    var px = 130, py = 230, pw = 600, ph = 450;
    c.save(); c.shadowColor = 'rgba(0,0,0,0.18)'; c.shadowBlur = 30; c.shadowOffsetY = 10;
    c.fillStyle = '#fff'; rr(px - 14, py - 14, pw + 28, ph + 28, 40); c.fill(); c.restore();
    if (hero) {
      c.save(); rr(px, py, pw, ph, 30); c.clip();
      var s = Math.max(pw / hero.width, ph / hero.height), iw = hero.width * s, ih = hero.height * s;
      c.drawImage(hero, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih); c.restore();
    }
    var sx = px + pw / 2, sy = 920;
    c.fillStyle = GOLD; star(c, sx, sy, 150, 128, 30); c.fill();
    c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(sx, sy, 112, 0, Math.PI * 2); c.fill();
    c.lineWidth = 6; c.strokeStyle = NAVY; c.beginPath(); c.arc(sx, sy, 100, 0, Math.PI * 2); c.stroke();
    c.fillStyle = GOLD; star(c, sx, sy - 30, 42, 18, 5); c.fill();
    c.fillStyle = NAVY; c.textAlign = 'center'; c.textBaseline = 'middle';
    fit(c, caps(C.skill), '700 {s}px ' + CF, 34, 170); c.fillText(caps(C.skill), sx, sy + 38);

    // right: texts
    var cx = 1230, maxW = 860;
    if (logo) { c.save(); c.beginPath(); c.arc(cx, 200, 78, 0, Math.PI * 2); c.clip(); c.drawImage(logo, cx - 78, 122, 156, 156); c.restore(); }
    c.fillStyle = NAVY; fit(c, T.c_title, '700 {s}px ' + CF, 82, maxW); c.fillText(T.c_title, cx, 350);
    c.fillStyle = '#5d6785'; c.font = '500 34px ' + SF; c.fillText(T.c_pre, cx, 440);
    c.fillStyle = NAVY; fit(c, name, '700 {s}px ' + CF, 124, maxW); c.fillText(name, cx, 545);
    c.strokeStyle = GOLD; c.lineWidth = 6; c.beginPath(); c.moveTo(cx - 380, 615); c.lineTo(cx + 380, 615); c.stroke();
    c.fillStyle = '#5d6785'; c.font = '500 34px ' + SF; c.fillText(T.c_learned, cx, 675);
    var sk = caps(C.skill);
    fit(c, sk, '700 {s}px ' + CF, 68, 700);
    var bw = c.measureText(sk).width + 110, by = 718, bh = 104;
    c.fillStyle = ACC;
    c.beginPath(); c.moveTo(cx - bw / 2 - 50, by + 14); c.lineTo(cx - bw / 2 + 10, by + 14); c.lineTo(cx - bw / 2 + 10, by + bh + 14);
    c.lineTo(cx - bw / 2 - 50, by + bh + 14); c.lineTo(cx - bw / 2 - 26, by + 14 + bh / 2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx + bw / 2 + 50, by + 14); c.lineTo(cx + bw / 2 - 10, by + 14); c.lineTo(cx + bw / 2 - 10, by + bh + 14);
    c.lineTo(cx + bw / 2 + 50, by + bh + 14); c.lineTo(cx + bw / 2 + 26, by + 14 + bh / 2); c.closePath(); c.fill();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.15)'; c.shadowBlur = 12; c.shadowOffsetY = 4;
    rr(cx - bw / 2, by, bw, bh, 18); c.fill(); c.restore();
    c.fillStyle = isLight(ACC) ? NAVY : '#fff'; c.fillText(sk, cx, by + bh / 2 + 3);
    c.fillStyle = NAVY; var song = T.c_song.replace('{song}', C.song);
    fit(c, song, 'italic 600 {s}px ' + SF, 36, maxW); c.fillText(song, cx, 900);

    var d = new Date(), ds = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
    c.strokeStyle = NAVY; c.lineWidth = 3;
    [[cx - 230, T.c_date, ds], [cx + 230, T.c_sign, '']].forEach(function (f) {
      c.beginPath(); c.moveTo(f[0] - 170, 1040); c.lineTo(f[0] + 170, 1040); c.stroke();
      c.fillStyle = NAVY; c.font = '700 40px ' + CF; if (f[2]) c.fillText(f[2], f[0], 1008);
      c.fillStyle = '#5d6785'; c.font = '500 28px ' + SF; c.fillText(f[1], f[0], 1076);
    });
    c.fillStyle = '#8a91a8'; c.font = '500 24px ' + SF; c.fillText(location.host, W / 2, H - 118);
  }

  function fileName() {
    return T.file + '-' + kidName.replace(/[\\/:*?"<>|\s]+/g, '-') + '.png';
  }

  root.addEventListener('click', function (e) {
    var a = e.target.closest('[data-qz]');
    if (!a) return;
    var k = a.getAttribute('data-qz');
    if (k === 'start' || k === 'again') start();
    if (k === 'dl') canvas.toBlob(function (b) {
      var l = document.createElement('a'); l.href = URL.createObjectURL(b); l.download = fileName();
      document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(l.href) }, 4000);
    }, 'image/png');
    if (k === 'print') {
      var f = document.createElement('iframe'), url = canvas.toDataURL('image/png');
      f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
      document.body.appendChild(f);
      var w = f.contentWindow, doc = w.document;
      doc.open();
      doc.write('<!doctype html><html><head><title>' + T.c_title + '</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0}img{width:100%;height:auto;display:block}</style></head><body><img src="' + url + '"></body></html>');
      doc.close();
      setTimeout(function () { w.focus(); w.print(); setTimeout(function () { f.remove() }, 3000) }, 500);
    }
  });

  $('.qz-form').addEventListener('submit', function (e) {
    e.preventDefault();
    kidName = input.value.trim().replace(/\s+/g, ' ');
    if (!kidName) return;
    draw(kidName).then(function () {
      cert.hidden = false;
      burst(canvas, 50);
      cert.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

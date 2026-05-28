(function () {
  try {
    var arena = document.getElementById('chase-arena');
    if (!arena) return;

    var logos = Array.from(arena.querySelectorAll('.chase-logo'));
    var n = logos.length;
    if (n === 0) return;

    var SZ = 26, M = 32;
    var ATTRACT = 0.04, REPEL = 0.3, MIN = 55, WANDER = 0.07, SPD = 1.8, DAMP = 0.92;

    var W = arena.offsetWidth || 380;
    var H = arena.offsetHeight || 220;

    var state = logos.map(function (el, i) {
      var qx = (i === 0 || i === 3) ? 0.25 : 0.75;
      var qy = (i < 2) ? 0.28 : 0.72;
      var x = W * qx;
      var y = H * qy;
      el.style.left = (x - SZ / 2) + 'px';
      el.style.top = (y - SZ / 2) + 'px';
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        a: Math.random() * Math.PI * 2,
        ws: 0.08 + Math.random() * 0.1
      };
    });

    function tick() {
      W = arena.offsetWidth || W || 380;
      H = arena.offsetHeight || H || 220;

      for (var i = 0; i < n; i++) {
        var s = state[i];
        var t = state[(i + 1) % n];

        s.a += (Math.random() - 0.5) * s.ws * 2;
        s.vx += Math.cos(s.a) * WANDER;
        s.vy += Math.sin(s.a) * WANDER;

        var dx = t.x - s.x, dy = t.y - s.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > MIN) {
          s.vx += (dx / d) * ATTRACT;
          s.vy += (dy / d) * ATTRACT;
        } else {
          s.vx -= (dx / d) * REPEL;
          s.vy -= (dy / d) * REPEL;
        }

        var spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (spd > SPD) { s.vx = s.vx / spd * SPD; s.vy = s.vy / spd * SPD; }

        s.x += s.vx; s.y += s.vy;

        var padX = Math.min(M, W / 2 - 1);
        var padY = Math.min(M, H / 2 - 1);

        if (s.x < padX) { s.x = padX; s.vx = Math.abs(s.vx); }
        if (s.x > W - padX) { s.x = W - padX; s.vx = -Math.abs(s.vx); }
        if (s.y < padY) { s.y = padY; s.vy = Math.abs(s.vy); }
        if (s.y > H - padY) { s.y = H - padY; s.vy = -Math.abs(s.vy); }

        s.vx *= DAMP; s.vy *= DAMP;

        logos[i].style.left = (s.x - SZ / 2) + 'px';
        logos[i].style.top = (s.y - SZ / 2) + 'px';
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  } catch (e) { console.error('chase:', e); }
})();

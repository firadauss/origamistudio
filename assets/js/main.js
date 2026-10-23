(function () {
    'use strict';

    /* ---- PENGATURAN: ganti dengan data asli ---- */
    var SETTINGS = {
        whatsapp: '6281200000000',          // format internasional tanpa + dan spasi
        email: 'hello@origamistudio.id',    // tujuan tombol "Kirim via Email"
        postsPerPage: 6                     // jumlah artikel per halaman di News
    };

    var header = document.getElementById('siteHeader');
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');

    /* Header shadow saat scroll */
    function onScroll() {
        if (!header) { return; }
        header.classList.toggle('scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Menu mobile */
    function closeNav() {
        if (!nav || !toggle) { return; }
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Buka menu');
    }
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        });
        nav.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') { closeNav(); }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeNav(); }
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) { closeNav(); }
        });
    }

    /* Animasi muncul saat scroll */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(function (el, i) {
            el.style.transitionDelay = ((i % 3) * 80) + 'ms';
            io.observe(el);
        });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }

    /* Filter portofolio */
    var filterBtns = document.querySelectorAll('.filter[data-filter]');
    var cards = document.querySelectorAll('.portfolio-grid .work-card');
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var f = btn.getAttribute('data-filter');
            filterBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
            cards.forEach(function (c) {
                var show = (f === 'all' || c.getAttribute('data-cat') === f);
                c.classList.toggle('is-hidden', !show);
                if (show) { c.classList.add('in'); }
            });
        });
    });

    /* Salin tautan artikel */
    var copyBtn = document.getElementById('copyLink');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            var url = copyBtn.getAttribute('data-url') || window.location.href;
            var done = function () {
                var old = copyBtn.textContent;
                copyBtn.textContent = 'Tersalin ✓';
                setTimeout(function () { copyBtn.textContent = old; }, 2000);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(done);
            } else {
                var ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (err) { /* abaikan */ }
                document.body.removeChild(ta);
            }
        });
    }

    /* Tahun hak cipta otomatis */
    var yearEl = document.querySelector('.footer-bottom p');
    if (yearEl) {
        yearEl.innerHTML = yearEl.innerHTML.replace(/©\s*\d{4}|&copy;\s*\d{4}/, '&copy; ' + new Date().getFullYear());
    }

    /* ---------------- News: filter, cari, halaman ---------------- */
    var grid = document.getElementById('newsGrid');
    if (grid) {
        var posts = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
        var pager = document.getElementById('newsPagination');
        var empty = document.getElementById('newsEmpty');
        var queryEl = document.getElementById('newsQuery');
        var catBtns = document.querySelectorAll('#newsFilters .filter');
        var state = { cat: 'all', q: '', page: 1 };

        var readUrl = function () {
            var p = new URLSearchParams(window.location.search);
            state.cat = p.get('cat') || 'all';
            state.q = (p.get('q') || '').slice(0, 80);
            state.page = parseInt(p.get('page'), 10) || 1;
        };
        var writeUrl = function () {
            var p = new URLSearchParams();
            if (state.cat !== 'all') { p.set('cat', state.cat); }
            if (state.q) { p.set('q', state.q); }
            if (state.page > 1) { p.set('page', state.page); }
            var qs = p.toString();
            try { history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '')); } catch (err) { /* abaikan */ }
        };

        var render = function () {
            var q = state.q.trim().toLowerCase();
            var matched = posts.filter(function (c) {
                var okCat = state.cat === 'all' || c.getAttribute('data-cat') === state.cat;
                var okQ = !q || (c.getAttribute('data-search') || '').indexOf(q) !== -1;
                return okCat && okQ;
            });
            var pages = Math.max(1, Math.ceil(matched.length / SETTINGS.postsPerPage));
            state.page = Math.min(Math.max(1, state.page), pages);
            var start = (state.page - 1) * SETTINGS.postsPerPage;
            var visible = matched.slice(start, start + SETTINGS.postsPerPage);

            posts.forEach(function (c) {
                var show = visible.indexOf(c) !== -1;
                c.classList.toggle('is-hidden', !show);
                if (show) { c.classList.add('in'); }
            });
            catBtns.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-cat') === state.cat); });
            if (empty) { empty.hidden = matched.length !== 0; }
            grid.hidden = matched.length === 0;

            pager.innerHTML = '';
            if (pages > 1) {
                var add = function (label, page, current) {
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = label;
                    if (current) { b.className = 'current'; b.setAttribute('aria-current', 'page'); }
                    b.addEventListener('click', function () {
                        state.page = page;
                        render();
                        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                    pager.appendChild(b);
                };
                if (state.page > 1) { add('← Sebelumnya', state.page - 1, false); }
                for (var i = 1; i <= pages; i++) { add(String(i), i, i === state.page); }
                if (state.page < pages) { add('Berikutnya →', state.page + 1, false); }
            }
            writeUrl();
        };

        readUrl();
        if (queryEl) { queryEl.value = state.q; }
        catBtns.forEach(function (b) {
            b.addEventListener('click', function () {
                state.cat = b.getAttribute('data-cat');
                state.page = 1;
                render();
            });
        });
        if (queryEl) {
            queryEl.addEventListener('input', function () {
                state.q = queryEl.value;
                state.page = 1;
                render();
            });
        }
        var reset = document.getElementById('newsReset');
        if (reset) {
            reset.addEventListener('click', function () {
                state = { cat: 'all', q: '', page: 1 };
                if (queryEl) { queryEl.value = ''; }
                render();
            });
        }
        render();
    }

    /* ---------------- Formulir kontak ---------------- */
    var form = document.getElementById('contactForm');
    if (form) {
        var alertBox = document.getElementById('formAlert');
        var fields = {
            name: form.elements.name, email: form.elements.email, phone: form.elements.phone,
            service: form.elements.service, budget: form.elements.budget, message: form.elements.message
        };

        // Pra-pilih layanan dari tautan ?service=
        var preset = new URLSearchParams(window.location.search).get('service');
        if (preset) {
            for (var i = 0; i < fields.service.options.length; i++) {
                if (fields.service.options[i].value === preset) { fields.service.value = preset; }
            }
        }

        var setError = function (key, msg) {
            var field = fields[key].closest('.field');
            var old = field.querySelector('.err');
            if (old) { old.remove(); }
            field.classList.toggle('has-error', !!msg);
            if (msg) {
                var el = document.createElement('small');
                el.className = 'err';
                el.textContent = msg;
                field.appendChild(el);
            }
        };

        var validate = function () {
            var ok = true;
            var v = function (key, cond, msg) {
                setError(key, cond ? '' : msg);
                if (!cond) { ok = false; }
            };
            v('name', fields.name.value.trim().length >= 2, 'Nama wajib diisi.');
            v('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim()), 'Masukkan alamat email yang valid.');
            v('service', fields.service.value !== '', 'Pilih layanan yang Anda butuhkan.');
            v('message', fields.message.value.trim().length >= 10, 'Ceritakan kebutuhan Anda minimal 10 karakter.');
            if (!ok) {
                var first = form.querySelector('.has-error input, .has-error select, .has-error textarea');
                if (first) { first.focus(); }
            }
            return ok;
        };

        var buildText = function () {
            var opt = function (el) { return el.value ? el.options[el.selectedIndex].text : '-'; };
            return [
                'Halo Origami Studio, saya ingin berdiskusi tentang proyek desain.',
                '',
                'Nama: ' + fields.name.value.trim(),
                'Email: ' + fields.email.value.trim(),
                'Telepon: ' + (fields.phone.value.trim() || '-'),
                'Layanan: ' + opt(fields.service),
                'Anggaran: ' + opt(fields.budget),
                '',
                fields.message.value.trim()
            ].join('\n');
        };

        var notify = function (msg) {
            alertBox.textContent = msg;
            alertBox.className = 'alert alert-success';
            alertBox.hidden = false;
            alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validate()) { return; }
            window.open('https://wa.me/' + SETTINGS.whatsapp + '?text=' + encodeURIComponent(buildText()), '_blank', 'noopener');
            notify('Terima kasih! WhatsApp dibuka dengan pesan yang sudah terisi. Tinggal tekan kirim.');
        });

        var emailBtn = document.getElementById('sendEmail');
        if (emailBtn) {
            emailBtn.addEventListener('click', function () {
                if (!validate()) { return; }
                var subject = 'Pesan baru dari website: ' + fields.service.options[fields.service.selectedIndex].text;
                window.location.href = 'mailto:' + SETTINGS.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildText());
                notify('Aplikasi email Anda dibuka dengan pesan yang sudah terisi. Tinggal tekan kirim.');
            });
        }
    }
})();

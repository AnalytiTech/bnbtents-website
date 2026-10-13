(function () {
  var cfg = window.BNB_CONFIG || {};

  document.getElementById("year").textContent = new Date().getFullYear();

  // Email links are filled in by script so the address isn't sitting in the HTML for scrapers.
  if (cfg.email) {
    document.querySelectorAll("[data-email]").forEach(function (a) { a.href = "mailto:" + cfg.email; });
    document.querySelectorAll("[data-email-text]").forEach(function (el) { el.textContent = cfg.email; });
  }

  if (cfg.bookingUrl) {
    var book = document.querySelector(".booking-btn");
    book.href = cfg.bookingUrl;
    book.hidden = false;
  }

  // Mobile menu
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  });

  // Hide the floating quote button once the form is on screen
  var cta = document.querySelector(".mobile-cta");
  var quote = document.getElementById("quote");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      cta.classList.toggle("hide", entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(quote);
  }

  // Quote form
  var form = document.getElementById("quote-form");
  var status = form.querySelector(".form-status");
  var submit = form.querySelector("button[type=submit]");

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  function collect() {
    var fd = new FormData(form);
    return {
      name: (fd.get("name") || "").trim(),
      phone: (fd.get("phone") || "").trim(),
      email: (fd.get("email") || "").trim(),
      event_type: fd.get("event_type") || "",
      event_date: fd.get("event_date") || "",
      location: (fd.get("location") || "").trim(),
      guests: fd.get("guests") || "",
      needs: fd.getAll("needs").join(", "),
      message: (fd.get("message") || "").trim(),
      botcheck: fd.get("botcheck")
    };
  }

  function summary(d) {
    return [
      "Name: " + d.name,
      "Phone: " + d.phone,
      "Email: " + d.email,
      "Event: " + d.event_type,
      "Date: " + (d.event_date || "not set"),
      "Location: " + (d.location || "not given"),
      "Guests: " + (d.guests || "not sure"),
      "Needs: " + (d.needs || "not sure"),
      "",
      d.message
    ].join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = [];
    form.querySelectorAll("[required]").forEach(function (el) {
      var ok = el.value.trim() && (el.type !== "email" || /.+@.+\..+/.test(el.value));
      el.classList.toggle("invalid", !ok);
      if (!ok) bad.push(el);
    });
    if (bad.length) { setStatus("Please fill in the highlighted fields.", "err"); bad[0].focus(); return; }

    var d = collect();
    if (d.botcheck) return;
    var subject = "Quote request: " + d.event_type + (d.event_date ? " on " + d.event_date : "");

    if (!cfg.web3formsKey) {
      // No form service set up yet: hand the request to the visitor's email app.
      window.location.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(summary(d));
      setStatus("Your email app should open with the request filled in. Just hit send.", "ok");
      return;
    }

    submit.disabled = true;
    setStatus("Sending...");
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: cfg.web3formsKey,
        subject: subject,
        from_name: "BNB Tents website",
        replyto: d.email,
        name: d.name, phone: d.phone, email: d.email,
        event_type: d.event_type, event_date: d.event_date, location: d.location,
        guests: d.guests, needs: d.needs, message: d.message
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message);
        form.reset();
        setStatus("Thanks! We got your request and will be in touch soon.", "ok");
      })
      .catch(function () {
        setStatus("Something went wrong. Please call or text " + cfg.phone + ".", "err");
      })
      .finally(function () { submit.disabled = false; });
  });
})();

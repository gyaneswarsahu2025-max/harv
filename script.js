$(function () {
  const $nav = $(".glass-nav");
  const $toggle = $(".menu-toggle");
  const $collapse = $("#mainNav");
  const $slides = $(".slide-item");
  const $dots = $(".slider-dot");
  const $next = $(".slider-next");
  const $prev = $(".slider-prev");
  const $testimonials = $(".testimonial-card");
  const $testimonialDots = $(".testimonial-dot");
  const $testimonialNext = $(".testimonial-next");
  const $testimonialPrev = $(".testimonial-prev");
  const $revealItems = $(".reveal-on-scroll, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3");
  let currentSlide = 0;
  let sliderTimer;
  let currentTestimonial = 0;
  let testimonialTimer;

  function syncNavbarState() {
    $nav.toggleClass("scrolled", $(window).scrollTop() > 20);
  }

  function handleReveal() {
    const triggerBottom = $(window).scrollTop() + $(window).height() * 0.88;

    $revealItems.each(function () {
      const $item = $(this);

      if ($item.offset().top < triggerBottom) {
        $item.addClass("is-visible");
      }
    });
  }

  function showSlide(index) {
    currentSlide = (index + $slides.length) % $slides.length;
    $slides.removeClass("is-active").eq(currentSlide).addClass("is-active");
    $dots.removeClass("is-active").eq(currentSlide).addClass("is-active");
  }

  function startSlider() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(function () {
      showSlide(currentSlide + 1);
    }, 4200);
  }

  function showTestimonial(index) {
    currentTestimonial = (index + $testimonials.length) % $testimonials.length;
    $testimonials.removeClass("is-active").eq(currentTestimonial).addClass("is-active");
    $testimonialDots.removeClass("is-active").eq(currentTestimonial).addClass("is-active");
  }

  function startTestimonialSlider() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(function () {
      showTestimonial(currentTestimonial + 1);
    }, 5200);
  }

  $toggle.on("click", function () {
    $(this).toggleClass("is-open");
  });

  $collapse.on("hidden.bs.collapse shown.bs.collapse", function () {
    $toggle.toggleClass("is-open", $collapse.hasClass("show"));
  });

  $next.on("click", function () {
    showSlide(currentSlide + 1);
    startSlider();
  });

  $prev.on("click", function () {
    showSlide(currentSlide - 1);
    startSlider();
  });

  $dots.on("click", function () {
    showSlide(Number($(this).data("slide")));
    startSlider();
  });

  $(".banner-slider").on("mouseenter", function () {
    clearInterval(sliderTimer);
  }).on("mouseleave", function () {
    startSlider();
  });

  $testimonialNext.on("click", function () {
    showTestimonial(currentTestimonial + 1);
    startTestimonialSlider();
  });

  $testimonialPrev.on("click", function () {
    showTestimonial(currentTestimonial - 1);
    startTestimonialSlider();
  });

  $testimonialDots.on("click", function () {
    showTestimonial(Number($(this).data("testimonial")));
    startTestimonialSlider();
  });

  $(".testimonial-slider").on("mouseenter", function () {
    clearInterval(testimonialTimer);
  }).on("mouseleave", function () {
    startTestimonialSlider();
  });

  $(window).on("scroll", function () {
    syncNavbarState();
    handleReveal();
  });

  syncNavbarState();
  handleReveal();
  showSlide(0);
  startSlider();
  showTestimonial(0);
  startTestimonialSlider();
});

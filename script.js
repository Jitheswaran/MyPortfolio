(function () {
  'use strict';

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      var target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Close mobile nav if open
        document.querySelector('.nav').classList.remove('is-open');
      }
    });
  });

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });
  }

  // Active nav link on scroll
  var sections = document.querySelectorAll('.section');
  function setActiveLink() {
    var scrollY = window.pageYOffset;
    sections.forEach(function (section) {
      var sectionTop = section.offsetTop - 120;
      var sectionHeight = section.offsetHeight;
      var sectionId = section.getAttribute('id');
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink);
  setActiveLink();

  // Project modal
  var projectDetails = {
    'core-risk': {
      title: 'Core Risk Platform Test Automation',
      role: 'Quality Automation Engineer | Nov 2023 – Present',
      summary: 'Cloud migration completed in Mar 2025; currently supporting feature integrations driven by customer requirements and revenue growth from credit report generation.',
      bullets: [
        'Automated previously manual billing validation processes by developing robust test cases to verify credit report charges using Google Cloud Datastore as the backend data source.',
        'Designed and implemented secure test automation workflows by creating and managing Google Cloud service accounts and authenticating via JSON key-based access to interact directly with cloud data stores.',
        'Built automation scripts to validate financial and transactional data accuracy, significantly reducing manual effort and improving test reliability and execution speed.',
        'Integrated automated test cases into CI/CD pipelines to enable continuous validation of billing and reporting features with every build and deployment.',
        'Enhanced test coverage for critical business flows related to credit report generation and customer billing, ensuring data consistency and compliance.',
        'Collaborated with cross-functional teams to align automation strategy with evolving customer requirements and platform enhancements.'
      ]
    },
    'ptec-migration': {
      title: 'Mainframe to Cloud Migration',
      role: 'Tester III | Sep 2023 – Nov 2023',
      summary: 'Contributed to a mainframe to cloud migration initiative, ensuring reliability and functional parity throughout the transition.',
      bullets: [
        'Designed and executed test cases to validate mainframe workloads migrated to the cloud environment.',
        'Verified data integrity and functional behaviour between legacy mainframe systems and the new cloud platform.',
        'Collaborated with developers and architects to identify migration defects and regression risks early.',
        'Documented test results and shared insights to improve migration quality and reduce cutover risk.'
      ]
    },
    'wipro-mt-mx': {
      title: 'MT to MX Migration Project',
      role: 'Test Engineer | Jul 2021 – Sep 2023',
      summary: 'Worked on international payments migration from MT to MX formats with a focus on SEPA and CHAPS flows.',
      bullets: [
        'Developed and executed automated test scripts to validate MT to MX payment flows, including SEPA and CHAPS.',
        'Performed API testing using tools like Postman and Bruno, validating message structures and integration behaviour.',
        'Used REST Assured and Java within CI/CD pipelines to increase regression coverage and accelerate feedback cycles.',
        'Collaborated with cross-functional teams using GitHub, JIRA and MySQL to track issues and verify fixes.',
        'Helped improve the reliability and accuracy of cross-border payment processing through rigorous test automation.'
      ]
    }
  };

  var modal = document.getElementById('project-modal');
  var modalContent = modal ? modal.querySelector('.project-modal-content') : null;

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  function openProjectModal(id) {
    if (!modal || !modalContent) return;
    var data = projectDetails[id];
    if (!data) return;

    var html = ''
      + '<h2 id="project-modal-title">' + data.title + '</h2>'
      + '<div class="project-modal-role">' + data.role + '</div>'
      + '<p class="project-modal-summary">' + data.summary + '</p>';

    if (data.bullets && data.bullets.length) {
      html += '<ul class="project-modal-list">';
      data.bullets.forEach(function (item) {
        html += '<li>' + item + '</li>';
      });
      html += '</ul>';
    }

    modalContent.innerHTML = html;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-project-modal-close')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  document.querySelectorAll('.project-card').forEach(function (card) {
    var id = card.getAttribute('data-project-id');
    if (!id) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      openProjectModal(id);
    });
  });

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

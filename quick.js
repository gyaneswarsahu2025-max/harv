// ===============================
// Subject Data Fallback
// ===============================
const fallbackSubjects = [
  { code: "MBA-501", name: "Marketing Management", lecturer: "Dr. S. Patel" },
  { code: "MBA-502", name: "Financial Management", lecturer: "Prof. R. Kumar" },
  { code: "MBA-503", name: "Human Resource Management", lecturer: "Dr. A. Singh" },
  { code: "MBA-504", name: "Operations Management", lecturer: "Prof. M. Das" },
  { code: "MBA-505", name: "Business Research Methods", lecturer: "Dr. K. Mohanty" },
  { code: "MBA-601", name: "Strategic Management", lecturer: "Prof. P. Nayak" },
  { code: "MBA-602", name: "Entrepreneurship Development", lecturer: "Dr. S. Rout" },
  { code: "MBA-603", name: "Business Analytics", lecturer: "Prof. R. Jena" },
  { code: "MBA-604", name: "International Business", lecturer: "Dr. L. Sahoo" },
  { code: "MBA-605", name: "Organizational Behavior", lecturer: "Prof. D. Pradhan" }
];

let subjects = [];
let currentTemplate = 't1';

const STORAGE_FORM = 'quick-form-data';
const STORAGE_TEMPLATE = 'quick-template';

// ===============================
// Initialize
// ===============================
$(document).ready(function() {
  loadSubjects();
  loadFormData();
  loadSavedTemplate();
  bindEvents();
  updateAllPreviews();
});

// ===============================
// Load Subjects
// ===============================
function loadSubjects() {
  $.getJSON('subjects.json')
    .done(function(data) {
      subjects = data.subjects;
      populateDropdown();
    })
    .fail(function() {
      subjects = fallbackSubjects;
      populateDropdown();
    });
}

function populateDropdown() {
  const $sel = $('#subjectSelect');
  $sel.empty().append('<option value="">Select subject...</option>');
  subjects.forEach(function(s, i) {
    $sel.append(`<option value="${i}">${s.code} - ${s.name}</option>`);
  });
}

// ===============================
// Bind Events
// ===============================
function bindEvents() {
  // Subject auto-fill
  $('#subjectSelect').on('change', function() {
    const idx = $(this).val();
    if (idx !== '') {
      const s = subjects[parseInt(idx)];
      // Store in dataset for preview updates
      $('#subjectSelect').data('selected', s);
    } else {
      $('#subjectSelect').removeData('selected');
    }
    saveFormData();
    updateAllPreviews();
  });

  // Text inputs
  $('#studentName, #regNo').on('input', function() {
    saveFormData();
    updateAllPreviews();
  });

  // Template selection
  $('.template-option').on('click', function() {
    selectTemplate($(this).data('template'));
  });

  // Download
  $('#downloadBtn').on('click', function() {
    downloadActive();
  });
}

// ===============================
// Template Selection
// ===============================
function selectTemplate(t) {
  currentTemplate = t;
  $('.template-option').removeClass('active');
  $(`.template-option[data-template="${t}"]`).addClass('active');

  // Scroll to active preview
  const $preview = $(`#preview-${t}`);
  $('.template-preview').removeClass('active-preview');
  $preview.addClass('active-preview');
  $preview[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

  localStorage.setItem(STORAGE_TEMPLATE, t);
}

function loadSavedTemplate() {
  const saved = localStorage.getItem(STORAGE_TEMPLATE);
  if (saved) {
    currentTemplate = saved;
    $('.template-option').removeClass('active');
    $(`.template-option[data-template="${saved}"]`).addClass('active');
    $(`.template-preview`).removeClass('active-preview');
    $(`#preview-${saved}`).addClass('active-preview');
  } else {
    $('.template-option[data-template="t1"]').addClass('active');
    $('#preview-t1').addClass('active-preview');
  }
}

// ===============================
// Update All Previews
// ===============================
function updateAllPreviews() {
  const selected = $('#subjectSelect').data('selected');
  const student = $('#studentName').val().trim() || '___________________';
  const regno = $('#regNo').val().trim() || '___________________';
  const code = selected ? selected.code : '______';
  const subject = selected ? selected.name : 'Subject Name';
  const lecturer = selected ? selected.lecturer : '___________________';

  for (let i = 1; i <= 6; i++) {
    $(`#t${i}-student`).text(student);
    $(`#t${i}-regno`).text(regno);
    $(`#t${i}-code`).text(code);
    $(`#t${i}-subject`).text(subject);
    $(`#t${i}-lecturer`).text(lecturer);
  }
}

// ===============================
// Save/Load Form Data
// ===============================
function saveFormData() {
  localStorage.setItem(STORAGE_FORM, JSON.stringify({
    studentName: $('#studentName').val().trim(),
    regNo: $('#regNo').val().trim(),
    subjectIndex: $('#subjectSelect').val()
  }));
}

function loadFormData() {
  const saved = localStorage.getItem(STORAGE_FORM);
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    $('#studentName').val(d.studentName || '');
    $('#regNo').val(d.regNo || '');
    if (d.subjectIndex !== undefined && d.subjectIndex !== '') {
      $('#subjectSelect').val(d.subjectIndex);
      // Trigger subject selection
      const $sel = $('#subjectSelect');
      const s = subjects[parseInt(d.subjectIndex)];
      if (s) {
        $sel.data('selected', s);
      }
    }
  } catch (e) {
    localStorage.removeItem(STORAGE_FORM);
  }
}

// ===============================
// Download Active Template
// ===============================
function downloadActive() {
  const $active = $(`.template-preview[data-template="${currentTemplate}"]`);
  if (!$active.length) {
    alert('Please select a template.');
    return;
  }

  const $btn = $('#downloadBtn');
  const orig = $btn.html();
  $btn.html('Generating...').prop('disabled', true);

  html2canvas($active[0], {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false
  }).then(canvas => {
    const link = document.createElement('a');
    const subj = $('#subjectSelect').data('selected');
    const name = subj ? subj.code : 'CoverPage';
    link.download = `${name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    $btn.html(orig).prop('disabled', false);
  }).catch(err => {
    console.error(err);
    alert('Failed to generate. Try again.');
    $btn.html(orig).prop('disabled', false);
  });
}

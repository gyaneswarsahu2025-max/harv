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
let currentBg = 'rit_1.png';

const STORAGE_FORM = 'fixedbg-form';
const STORAGE_BG = 'fixedbg-bg';

// ===============================
// Initialize
// ===============================
$(document).ready(function() {
  loadSubjects();
  loadFormData();
  loadSavedBg();
  bindEvents();
  updateFields();
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
  $sel.empty().append('<option value="">Choose a subject...</option>');
  subjects.forEach(function(s, i) {
    $sel.append(`<option value="${i}">${s.code} - ${s.name}</option>`);
  });
}

// ===============================
// Bind Events
// ===============================
function bindEvents() {
  // Subject selection
  $('#subjectSelect').on('change', function() {
    const idx = $(this).val();
    if (idx !== '') {
      const s = subjects[parseInt(idx)];
      $('#subjectSelect').data('selected', s);
      $('#sdCode').text(s.code);
      $('#sdName').text(s.name);
      $('#sdLecturer').text(s.lecturer);
      $('#subjectDetailBox').slideDown(200);
    } else {
      $('#subjectSelect').removeData('selected');
      $('#subjectDetailBox').slideUp(200);
    }
    saveFormData();
    updateFields();
  });

  // Text inputs
  $('#studentName, #regNo').on('input', function() {
    saveFormData();
    updateFields();
  });

  // Background selection
  $('.bg-option').on('click', function() {
    selectBg($(this).data('bg'));
  });

  // Download
  $('#downloadBtn').on('click', function() {
    downloadActive();
  });
}

// ===============================
// Background Selection
// ===============================
function selectBg(bg) {
  currentBg = bg;
  $('.bg-option').removeClass('active');
  $(`.bg-option[data-bg="${bg}"]`).addClass('active');

  $('.bg-preview').removeClass('active-preview');
  $(`.bg-preview[data-bg="${bg}"]`).addClass('active-preview');

  // Scroll to active
  const $preview = $(`.bg-preview[data-bg="${bg}"]`);
  $preview[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

  localStorage.setItem(STORAGE_BG, bg);
}

function loadSavedBg() {
  const saved = localStorage.getItem(STORAGE_BG);
  if (saved) {
    currentBg = saved;
    $('.bg-option').removeClass('active');
    $(`.bg-option[data-bg="${saved}"]`).addClass('active');
    $('.bg-preview').removeClass('active-preview');
    $(`.bg-preview[data-bg="${saved}"]`).addClass('active-preview');
  } else {
    $('.bg-option[data-bg="rit_1.png"]').addClass('active');
    $('#preview-bg1').addClass('active-preview');
  }
}

// ===============================
// Update All Fields
// ===============================
function updateFields() {
  const selected = $('#subjectSelect').data('selected');
  const student = $('#studentName').val().trim() || '___________________';
  const regno = $('#regNo').val().trim() || '___________________';
  const code = selected ? selected.code : '______';
  const subject = selected ? selected.name : 'Subject Name';
  const lecturer = selected ? selected.lecturer : '___________________';

  // Update all backgrounds (bg1, bg2)
  ['1', '2'].forEach(function(i) {
    $(`#bg${i}-code .ff-value`).text(code);
    $(`#bg${i}-subject .ff-value`).text(subject);
    $(`#bg${i}-student .ff-value`).text(student);
    $(`#bg${i}-regno .ff-value`).text(regno);
    $(`#bg${i}-lecturer .ff-value`).text(lecturer);
  });
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
      const s = subjects[parseInt(d.subjectIndex)];
      if (s) {
        $('#subjectSelect').data('selected', s);
        $('#sdCode').text(s.code);
        $('#sdName').text(s.name);
        $('#sdLecturer').text(s.lecturer);
        $('#subjectDetailBox').show();
      }
    }
  } catch (e) {
    localStorage.removeItem(STORAGE_FORM);
  }
}

// ===============================
// Download Active Background
// ===============================
function downloadActive() {
  const $active = $(`.bg-preview[data-bg="${currentBg}"]`);
  if (!$active.length) { alert('Select a background.'); return; }

  const $btn = $('#downloadBtn');
  const orig = $btn.html();
  $btn.html('Generating...').prop('disabled', true);

  $active.addClass('downloading');

  html2canvas($active[0], {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false
  }).then(canvas => {
    $active.removeClass('downloading');

    const link = document.createElement('a');
    const subj = $('#subjectSelect').data('selected');
    const name = subj ? subj.code : 'CoverPage';
    link.download = `${name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    $btn.html(orig).prop('disabled', false);
  }).catch(err => {
    $active.removeClass('downloading');
    console.error(err);
    alert('Failed to generate.');
    $btn.html(orig).prop('disabled', false);
  });
}

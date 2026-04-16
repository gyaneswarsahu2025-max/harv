// ===============================
// Subject Data (Fallback)
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

// ===============================
// Global Variables
// ===============================
let currentBgImage = null;
let fieldPositions = {};

// Per-field font settings
const defaultFontSettings = {
  studentName:  { family: "'Times New Roman', serif", size: 22, color: "#0d4a7a", bold: false, italic: false },
  regNo:        { family: "'Times New Roman', serif", size: 20, color: "#0d4a7a", bold: false, italic: false },
  courseCode:   { family: "'Courier New', monospace", size: 22, color: "#c75b2a", bold: true,  italic: false },
  subjectName:  { family: "'Inter', sans-serif",      size: 24, color: "#0d4a7a", bold: true,  italic: true  },
  lecturerName: { family: "'Times New Roman', serif", size: 20, color: "#0d4a7a", bold: false, italic: false }
};

let fieldFontSettings = JSON.parse(JSON.stringify(defaultFontSettings));

let dragState = {
  active: false,
  field: null,
  offsetX: 0,
  offsetY: 0
};

// ===============================
// Storage Keys
// ===============================
const STORAGE_KEY_FIELDS = 'designer-field-positions';
const STORAGE_KEY_FORM = 'designer-form-data';
const STORAGE_KEY_FONTS = 'designer-font-settings';

// ===============================
// Initialize
// ===============================
$(document).ready(function() {
  loadSubjects();
  loadFieldPositions();
  loadFontSettings();
  loadFormData();
  bindEvents();
  updateDisplayFields();
  applyAllFontSettings();
});

// ===============================
// Load Subjects
// ===============================
function loadSubjects() {
  $.getJSON('subjects.json')
    .done(function(data) {
      subjects = data.subjects;
      populateSubjectDropdown();
    })
    .fail(function() {
      subjects = fallbackSubjects;
      populateSubjectDropdown();
    });
}

function populateSubjectDropdown() {
  const $select = $('#subjectSelect');
  $select.empty();
  $select.append('<option value="">Select a subject...</option>');
  
  subjects.forEach(function(subject, index) {
    $select.append(`<option value="${index}">${subject.code} - ${subject.name}</option>`);
  });
}

// ===============================
// Bind Events
// ===============================
function bindEvents() {
  // Subject selection - auto-fill course code, subject name, lecturer
  $('#subjectSelect').on('change', function() {
    const selectedIndex = $(this).val();
    if (selectedIndex !== '') {
      const subject = subjects[parseInt(selectedIndex)];
      $('#courseCode').val(subject.code);
      $('#subjectName').val(subject.name);
      $('#lecturerName').val(subject.lecturer);
    } else {
      $('#courseCode').val('');
      $('#subjectName').val('');
      $('#lecturerName').val('');
    }
    saveFormData();
    updateDisplayFields();
  });

  // File upload
  $('#bgUpload').on('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        currentBgImage = e.target.result;
        $('#uploadedBg').attr('src', currentBgImage);
        $('#uploadPlaceholder').hide();
        $('#uploadPreview').show();
        $('#noBgMessage').hide();
        $('#coverCanvas').show();
        $('#canvasBg').attr('src', currentBgImage);
        $('.predefined-bg').removeClass('active');
        resetFieldPositions();
      };
      reader.readAsDataURL(file);
    }
  });

  // Predefined background selection
  $('.predefined-bg').on('click', function() {
    const bgFile = $(this).data('bg');
    
    currentBgImage = bgFile;
    
    // Show uploaded preview
    $('#uploadedBg').attr('src', bgFile);
    $('#uploadPlaceholder').hide();
    $('#uploadPreview').show();
    
    // Activate canvas
    $('#noBgMessage').hide();
    $('#coverCanvas').show();
    $('#canvasBg').attr('src', bgFile);
    
    // Mark active
    $('.predefined-bg').removeClass('active');
    $(this).addClass('active');
    
    resetFieldPositions();
  });

  // Remove background
  $('#removeBg').on('click', function(e) {
    e.stopPropagation();
    currentBgImage = null;
    $('#bgUpload').val('');
    $('#uploadPreview').hide();
    $('#uploadPlaceholder').show();
    $('#noBgMessage').show();
    $('#coverCanvas').hide();
    $('.predefined-bg').removeClass('active');
  });

  // Form inputs
  $('#studentName, #regNo, #courseCode, #subjectName, #lecturerName').on('input', function() {
    saveFormData();
    updateDisplayFields();
  });

  // Font control toggles (accordion)
  $('.ffc-header').on('click', function() {
    const $control = $(this).closest('.field-font-control');
    const isOpen = $control.hasClass('open');
    
    // Close all
    $('.field-font-control').removeClass('open');
    
    // Open clicked if it was closed
    if (!isOpen) {
      $control.addClass('open');
    }
  });

  // Font settings change handlers
  $('.ffc-family').on('change', function() {
    const field = $(this).data('field');
    fieldFontSettings[field].family = $(this).val();
    applyFontToField(field);
    saveFontSettings();
  });

  $('.ffc-size').on('input', function() {
    const field = $(this).data('field');
    const size = $(this).val();
    fieldFontSettings[field].size = parseInt(size);
    $(`.ffc-size-val[data-field="${field}"]`).text(size + 'px');
    applyFontToField(field);
    saveFontSettings();
  });

  $('.ffc-color').on('input', function() {
    const field = $(this).data('field');
    fieldFontSettings[field].color = $(this).val();
    applyFontToField(field);
    saveFontSettings();
  });

  $('.ffc-bold').on('change', function() {
    const field = $(this).data('field');
    fieldFontSettings[field].bold = $(this).is(':checked');
    applyFontToField(field);
    saveFontSettings();
  });

  $('.ffc-italic').on('change', function() {
    const field = $(this).data('field');
    fieldFontSettings[field].italic = $(this).is(':checked');
    applyFontToField(field);
    saveFontSettings();
  });

  // Download
  $('#download').on('click', function() {
    downloadCoverPage();
  });

  // Draggable fields
  initDraggableFields();
}

// ===============================
// Apply Font Settings
// ===============================
function applyFontToField(field) {
  const settings = fieldFontSettings[field];
  const $value = $(`#disp${capitalize(field)}`);
  
  $value.css({
    'font-family': settings.family,
    'font-size': settings.size + 'px',
    'color': settings.color,
    'font-weight': settings.bold ? '700' : '400',
    'font-style': settings.italic ? 'italic' : 'normal'
  });
}

function applyAllFontSettings() {
  Object.keys(fieldFontSettings).forEach(field => {
    // Update UI controls
    const $control = $(`.field-font-control[data-field="${field}"]`);
    $control.find('.ffc-family').val(fieldFontSettings[field].family);
    $control.find('.ffc-size').val(fieldFontSettings[field].size);
    $control.find(`.ffc-size-val`).text(fieldFontSettings[field].size + 'px');
    $control.find('.ffc-color').val(fieldFontSettings[field].color);
    $control.find('.ffc-bold').prop('checked', fieldFontSettings[field].bold);
    $control.find('.ffc-italic').prop('checked', fieldFontSettings[field].italic);
    
    // Apply to display field
    applyFontToField(field);
  });
}

function capitalize(str) {
  const map = {
    studentName: 'StudentName',
    regNo: 'RegNo',
    courseCode: 'CourseCode',
    subjectName: 'SubjectName',
    lecturerName: 'LecturerName'
  };
  return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
}

// ===============================
// Draggable Fields
// ===============================
function initDraggableFields() {
  const $canvas = $('#coverCanvas');
  
  $('.draggable-field').each(function() {
    const $field = $(this);
    const fieldId = $field.data('field');
    
    if (fieldPositions[fieldId]) {
      $field.css({
        left: fieldPositions[fieldId].x + 'px',
        top: fieldPositions[fieldId].y + 'px'
      });
    } else {
      const defaults = {
        studentName:  { x: 100, y: 550 },
        regNo:        { x: 100, y: 620 },
        courseCode:   { x: 200, y: 400 },
        subjectName:  { x: 200, y: 450 },
        lecturerName: { x: 350, y: 550 }
      };
      
      if (defaults[fieldId]) {
        $field.css({ left: defaults[fieldId].x + 'px', top: defaults[fieldId].y + 'px' });
        fieldPositions[fieldId] = defaults[fieldId];
      }
    }
  });

  // Mouse drag
  $canvas.on('mousedown', '.draggable-field', function(e) {
    if ($(e.target).is('input, select')) return;
    e.preventDefault();
    const $field = $(this);
    const rect = this.getBoundingClientRect();
    
    dragState = {
      active: true,
      field: $field,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
    
    $field.addClass('dragging');
  });

  $(document).on('mousemove', function(e) {
    if (!dragState.active || !currentBgImage) return;
    
    const $canvas = $('#coverCanvas');
    const canvasRect = $canvas[0].getBoundingClientRect();
    
    let newX = e.clientX - canvasRect.left - dragState.offsetX;
    let newY = e.clientY - canvasRect.top - dragState.offsetY;
    
    const $field = dragState.field;
    const fieldWidth = $field.outerWidth();
    const fieldHeight = $field.outerHeight();
    const canvasWidth = $canvas.width();
    const canvasHeight = $canvas.height();
    
    newX = Math.max(0, Math.min(newX, canvasWidth - fieldWidth));
    newY = Math.max(0, Math.min(newY, canvasHeight - fieldHeight));
    
    $field.css({ left: newX + 'px', top: newY + 'px' });
  });

  $(document).on('mouseup', function() {
    if (dragState.active) {
      const $field = dragState.field;
      const fieldId = $field.data('field');
      
      fieldPositions[fieldId] = {
        x: parseInt($field.css('left')),
        y: parseInt($field.css('top'))
      };
      
      saveFieldPositions();
      $field.removeClass('dragging');
      dragState.active = false;
      dragState.field = null;
    }
  });

  // Touch support
  $canvas.on('touchstart', '.draggable-field', function(e) {
    if ($(e.target).is('input, select')) return;
    const touch = e.originalEvent.touches[0];
    const $field = $(this);
    const rect = this.getBoundingClientRect();
    
    dragState = {
      active: true,
      field: $field,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top
    };
    
    $field.addClass('dragging');
  });

  $(document).on('touchmove', function(e) {
    if (!dragState.active || !currentBgImage) return;
    e.preventDefault();
    
    const touch = e.originalEvent.touches[0];
    const $canvas = $('#coverCanvas');
    const canvasRect = $canvas[0].getBoundingClientRect();
    
    let newX = touch.clientX - canvasRect.left - dragState.offsetX;
    let newY = touch.clientY - canvasRect.top - dragState.offsetY;
    
    const $field = dragState.field;
    const fieldWidth = $field.outerWidth();
    const fieldHeight = $field.outerHeight();
    const canvasWidth = $canvas.width();
    const canvasHeight = $canvas.height();
    
    newX = Math.max(0, Math.min(newX, canvasWidth - fieldWidth));
    newY = Math.max(0, Math.min(newY, canvasHeight - fieldHeight));
    
    $field.css({ left: newX + 'px', top: newY + 'px' });
  });

  $(document).on('touchend', function() {
    if (dragState.active) {
      const $field = dragState.field;
      const fieldId = $field.data('field');
      
      fieldPositions[fieldId] = {
        x: parseInt($field.css('left')),
        y: parseInt($field.css('top'))
      };
      
      saveFieldPositions();
      $field.removeClass('dragging');
      dragState.active = false;
      dragState.field = null;
    }
  });
}

// ===============================
// Update Display Fields
// ===============================
function updateDisplayFields() {
  $('#dispStudentName').text($('#studentName').val().trim() || 'Student Name');
  $('#dispRegNo').text($('#regNo').val().trim() || 'Reg. Number');
  $('#dispCourseCode').text($('#courseCode').val().trim() || 'Course Code');
  $('#dispSubjectName').text($('#subjectName').val().trim() || 'Subject Name');
  $('#dispLecturerName').text($('#lecturerName').val().trim() || 'Lecturer');
}

// ===============================
// Reset Field Positions
// ===============================
function resetFieldPositions() {
  const defaults = {
    studentName:  { x: 100, y: 550 },
    regNo:        { x: 100, y: 620 },
    courseCode:   { x: 200, y: 400 },
    subjectName:  { x: 200, y: 450 },
    lecturerName: { x: 350, y: 550 }
  };

  fieldPositions = defaults;

  $('.draggable-field').each(function() {
    const $field = $(this);
    const fieldId = $field.data('field');
    
    if (defaults[fieldId]) {
      $field.css({ left: defaults[fieldId].x + 'px', top: defaults[fieldId].y + 'px' });
    }
  });

  saveFieldPositions();
}

// ===============================
// Save/Load Field Positions
// ===============================
function saveFieldPositions() {
  localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(fieldPositions));
}

function loadFieldPositions() {
  const saved = localStorage.getItem(STORAGE_KEY_FIELDS);
  if (saved) {
    try {
      fieldPositions = JSON.parse(saved);
    } catch (e) {
      fieldPositions = {};
    }
  }
}

// ===============================
// Save/Load Font Settings
// ===============================
function saveFontSettings() {
  localStorage.setItem(STORAGE_KEY_FONTS, JSON.stringify(fieldFontSettings));
}

function loadFontSettings() {
  const saved = localStorage.getItem(STORAGE_KEY_FONTS);
  if (saved) {
    try {
      fieldFontSettings = JSON.parse(saved);
    } catch (e) {
      fieldFontSettings = JSON.parse(JSON.stringify(defaultFontSettings));
    }
  }
}

// ===============================
// Save/Load Form Data
// ===============================
function saveFormData() {
  const data = {
    studentName:  $('#studentName').val().trim(),
    regNo:        $('#regNo').val().trim(),
    courseCode:   $('#courseCode').val().trim(),
    subjectName:  $('#subjectName').val().trim(),
    lecturerName: $('#lecturerName').val().trim(),
    subjectIndex: $('#subjectSelect').val()
  };
  localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(data));
}

function loadFormData() {
  const saved = localStorage.getItem(STORAGE_KEY_FORM);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      $('#studentName').val(data.studentName || '');
      $('#regNo').val(data.regNo || '');
      $('#courseCode').val(data.courseCode || '');
      $('#subjectName').val(data.subjectName || '');
      $('#lecturerName').val(data.lecturerName || '');
      if (data.subjectIndex !== undefined && data.subjectIndex !== '') {
        $('#subjectSelect').val(data.subjectIndex);
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY_FORM);
    }
  }
}

// ===============================
// Download Cover Page
// ===============================
function downloadCoverPage() {
  if (!currentBgImage) {
    alert('Please upload a background image first!');
    return;
  }

  const $btn = $('#download');
  const originalText = $btn.html();
  $btn.html('Generating...').prop('disabled', true);

  const coverCanvas = document.getElementById('coverCanvas');

  // Hide labels and chrome via class - no layout-affecting changes
  $(coverCanvas).addClass('downloading');

  html2canvas(coverCanvas, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false
  }).then(canvas => {
    $(coverCanvas).removeClass('downloading');

    const link = document.createElement('a');
    const subjectName = $('#subjectName').val().trim() || 'CoverPage';
    link.download = `${subjectName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    $btn.html(originalText).prop('disabled', false);
  }).catch(error => {
    $(coverCanvas).removeClass('downloading');

    console.error('Error generating image:', error);
    alert('Failed to generate image. Please try again.');
    $btn.html(originalText).prop('disabled', false);
  });
}

// ===============================
// Subject Data (Fallback if JSON fails to load)
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

// Global variables
let subjects = [];
let currentDesign = 'design1';
let selectedSubject = null;

// ===============================
// Storage Keys
// ===============================
const STORAGE_KEY = "cover-page-form-data";
const DESIGN_KEY = "cover-page-design";

// ===============================
// Initialize Application
// ===============================
$(document).ready(function() {
  loadSubjects();
  loadFormData();
  loadSavedDesign();
  bindEvents();
  updatePreview();
});

// ===============================
// Load Subjects from JSON
// ===============================
function loadSubjects() {
  $.getJSON('subjects.json')
    .done(function(data) {
      subjects = data.subjects;
      populateSubjectDropdown();
    })
    .fail(function() {
      console.log('Failed to load subjects.json, using fallback data');
      subjects = fallbackSubjects;
      populateSubjectDropdown();
    });
}

// ===============================
// Populate Subject Dropdown
// ===============================
function populateSubjectDropdown() {
  const $select = $('#subjectSelect');
  $select.empty();
  $select.append('<option value="">Select a subject...</option>');
  
  subjects.forEach((subject, index) => {
    $select.append(`<option value="${index}">${subject.code} - ${subject.name}</option>`);
  });
}

// ===============================
// Bind Events
// ===============================
function bindEvents() {
  // Form inputs - auto-save and update preview
  $('#regNo, #studentName').on('input', function() {
    saveFormData();
    updatePreview();
  });

  // Subject selection
  $('#subjectSelect').on('change', function() {
    const selectedIndex = $(this).val();
    if (selectedIndex !== '') {
      selectedSubject = subjects[parseInt(selectedIndex)];
      displaySubjectInfo();
      saveFormData();
      updatePreview();
    } else {
      selectedSubject = null;
      $('#subjectInfoBox').slideUp(200);
      saveFormData();
      updatePreview();
    }
  });

  // Design selection
  $('.design-option').on('click', function() {
    const design = $(this).data('design');
    selectDesign(design);
    saveDesign(design);
  });

  // Generate button
  $('#generate').on('click', function() {
    saveFormData();
    updatePreview();
    
    // Visual feedback
    const $btn = $(this);
    $btn.addClass('active').prop('disabled', true);
    setTimeout(() => {
      $btn.removeClass('active').prop('disabled', false);
    }, 300);
  });

  // Download button
  $('#download').on('click', function() {
    downloadCoverPage();
  });
}

// ===============================
// Display Subject Information
// ===============================
function displaySubjectInfo() {
  if (!selectedSubject) return;

  $('#subjectCode').text(selectedSubject.code);
  $('#subjectName').text(selectedSubject.name);
  $('#subjectLecturer').text(selectedSubject.lecturer);
  $('#subjectInfoBox').slideDown(300);
}

// ===============================
// Design Selection
// ===============================
function selectDesign(design) {
  currentDesign = design;
  
  // Update UI
  $('.design-option').removeClass('active');
  $(`.design-option[data-design="${design}"]`).addClass('active');
  
  // Update cover page class
  $('#coverPage').attr('data-design', design);
  
  updatePreview();
}

// ===============================
// Load Saved Design
// ===============================
function loadSavedDesign() {
  const savedDesign = localStorage.getItem(DESIGN_KEY);
  if (savedDesign) {
    currentDesign = savedDesign;
    $('.design-option').removeClass('active');
    $(`.design-option[data-design="${savedDesign}"]`).addClass('active');
    $('#coverPage').attr('data-design', savedDesign);
  } else {
    $('.design-option[data-design="design1"]').addClass('active');
  }
}

// ===============================
// Save Design
// ===============================
function saveDesign(design) {
  localStorage.setItem(DESIGN_KEY, design);
}

// ===============================
// Update Preview
// ===============================
function updatePreview() {
  const regNo = $('#regNo').val().trim();
  const studentName = $('#studentName').val().trim();
  
  // Get subject data
  const code = selectedSubject ? selectedSubject.code : '______';
  const name = selectedSubject ? selectedSubject.name : 'Subject Name';
  const lecturer = selectedSubject ? selectedSubject.lecturer : '_______________________';

  // Update cover page fields
  $('#cpSubjectName').text(name);
  $('#cpCourseCode').text(code);
  $('#cpStudentName').text(studentName || '_______________________');
  $('#cpRegNo').text(regNo || '_______________________');
  $('#cpLecturerName').text(lecturer);
}

// ===============================
// Form Data Management
// ===============================
function getFormData() {
  return {
    regNo: $('#regNo').val().trim(),
    studentName: $('#studentName').val().trim(),
    subjectIndex: $('#subjectSelect').val()
  };
}

function saveFormData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
}

function loadFormData() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  
  if (!savedData) return;

  try {
    const data = JSON.parse(savedData);
    $('#regNo').val(data.regNo || '');
    $('#studentName').val(data.studentName || '');
    
    if (data.subjectIndex !== undefined && data.subjectIndex !== '') {
      $('#subjectSelect').val(data.subjectIndex);
      selectedSubject = subjects[parseInt(data.subjectIndex)];
      if (selectedSubject) {
        displaySubjectInfo();
      }
    }
  } catch (error) {
    console.error('Error loading saved form data:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ===============================
// Download Cover Page
// ===============================
function downloadCoverPage() {
  const coverPage = document.getElementById('coverPage');
  
  if (!coverPage) {
    alert('Cover page not found!');
    return;
  }

  // Show loading state
  const $btn = $('#download');
  const originalText = $btn.html();
  $btn.html('Generating...').prop('disabled', true);

  html2canvas(coverPage, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false
  }).then(canvas => {
    const link = document.createElement('a');
    const studentName = $('#studentName').val().trim() || 'Student';
    const subjectCode = selectedSubject ? selectedSubject.code : 'Assignment';
    link.download = `CoverPage-${subjectCode}-${studentName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Reset button
    $btn.html(originalText).prop('disabled', false);
  }).catch(error => {
    console.error('Error generating image:', error);
    alert('Failed to generate image. Please try again.');
    $btn.html(originalText).prop('disabled', false);
  });
}

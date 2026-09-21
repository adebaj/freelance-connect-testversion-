// POST JOB FUNCTION
function postJob() {
  let title = document.getElementById('title').value
  let description = document.getElementById('description').value
  let budget = document.getElementById('budget').value

  if (!title || !description || !budget) {
    alert('Please fill all fields')
    return
  }

  let job = {
    title: title,
    description: description,
    budget: budget,
    date: new Date().toLocaleString(),
  }

  let jobs = JSON.parse(localStorage.getItem('jobs')) || []
  jobs.unshift(job) // newest job first
  localStorage.setItem('jobs', JSON.stringify(jobs))

  alert('Job Posted Successfully!')

  document.getElementById('title').value = ''
  document.getElementById('description').value = ''
  document.getElementById('budget').value = ''
}

// LOAD JOBS ON DASHBOARD
function loadJobs() {
  let container = document.getElementById('jobsContainer')

  // If the element doesn't exist, stop
  if (!container) return

  let jobs = JSON.parse(localStorage.getItem('jobs')) || []

  if (jobs.length === 0) {
    container.innerHTML = '<p>No jobs available yet.</p>'
    return
  }

  container.innerHTML = ''

  jobs.forEach((job) => {
    container.innerHTML += `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p><strong>Budget:</strong> $${job.budget}</p>
                <p><small>Posted: ${job.date}</small></p>
                <button>Apply</button>
            </div>
        `
  })
}

// Automatically run loadJobs when page loads
document.addEventListener('DOMContentLoaded', loadJobs)

// REGISTER FUNCTION
function registerUser() {
  let fullname = document.getElementById('fullname').value
  let email = document.getElementById('regEmail').value
  let password = document.getElementById('regPassword').value
  let role = document.getElementById('role').value

  if (!fullname || !email || !password) {
    alert('Please fill all fields')
    return
  }

  let users = JSON.parse(localStorage.getItem('users')) || []

  let alreadyExists = users.some((user) => user.email === email)
  if (alreadyExists) {
    alert('An account with this email already exists. Please login.')
    return
  }

  users.push({ fullname: fullname, email: email, password: password, role: role })
  localStorage.setItem('users', JSON.stringify(users))

  alert('Registration successful! Please login.')
  window.location.href = './loginpage.html'
}

// LOGIN FUNCTION
function loginUser() {
  let email = document.getElementById('email').value
  let password = document.getElementById('password').value

  if (!email || !password) {
    alert('Please fill all fields')
    return
  }

  let users = JSON.parse(localStorage.getItem('users')) || []
  let match = users.find((user) => user.email === email && user.password === password)

  if (!match) {
    alert('Incorrect email or password')
    return
  }

  localStorage.setItem('currentUser', JSON.stringify(match))
  window.location.href = './freelancers-dashboard.html'
}

// LOGOUT FUNCTION
function logoutUser() {
  localStorage.removeItem('currentUser')
  window.location.href = './index.html'
}

// AUTH GUARD - call on pages that require login
function requireLogin() {
  let currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser) {
    alert('Please login to view this page')
    window.location.href = './loginpage.html'
    return
  }

  // logged in - reveal the content that was hidden by default in the HTML
  let protectedContent = document.getElementById('protectedContent')
  if (protectedContent) {
    protectedContent.style.display = ''
  }

  // newer pages hide multiple elements via a shared class instead of one
  // wrapper div - removing the class (rather than touching inline style)
  // is what actually undoes a class-based "display: none"
  document.querySelectorAll('.dashboard-protected').forEach(function (el) {
    el.classList.remove('dashboard-protected')
  })
}

// CLEAR LOGIN / REGISTER FORMS
// Browsers auto-refill email/password fields (autofill) and can also
// restore a page exactly as it was from the back/forward cache when you
// navigate back to it - both make old input look like it "stuck around"
// even though nothing in the app actually saved it. This wipes the
// fields every time the login or register page is shown.
function clearLoginForm() {
  let emailField = document.getElementById('email')
  let passwordField = document.getElementById('password')
  if (emailField) emailField.value = ''
  if (passwordField) passwordField.value = ''

  let fullnameField = document.getElementById('fullname')
  let regEmailField = document.getElementById('regEmail')
  let regPasswordField = document.getElementById('regPassword')
  if (fullnameField) fullnameField.value = ''
  if (regEmailField) regEmailField.value = ''
  if (regPasswordField) regPasswordField.value = ''
}
document.addEventListener('DOMContentLoaded', clearLoginForm)
window.addEventListener('pageshow', clearLoginForm)
setTimeout(clearLoginForm, 100)
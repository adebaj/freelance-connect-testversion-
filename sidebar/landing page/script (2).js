// ---------- IMAGE HELPERS ----------
const MAX_IMAGE_SIZE_MB = 5 // reject files bigger than this before processing
const MAX_IMAGE_DIMENSION = 1200 // px - images are scaled down to fit this

// checks the chosen file; returns an error message, or '' if it's fine
function validateImage(file) {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file (JPG, PNG, WEBP, etc.)'
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return 'Image is too large. Please choose one under ' + MAX_IMAGE_SIZE_MB + 'MB.'
  }
  return ''
}

// reads the file, scales it down and returns a compressed data URL.
// localStorage only holds ~5MB total, so storing raw photos would
// fill it after a job or two - shrinking keeps each image small.
function fileToCompressedDataUrl(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the image'))
    reader.onload = () => {
      let img = new Image()
      img.onerror = () => reject(new Error('Could not load the image'))
      img.onload = () => {
        let scale = Math.min(
          1,
          MAX_IMAGE_DIMENSION / Math.max(img.width, img.height)
        )
        let canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        let ctx = canvas.getContext('2d')
        // white backdrop so transparent PNGs don't turn black as JPEG
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// shows a preview under the file input as soon as a file is chosen
function previewJobImage() {
  let input = document.getElementById('jobImage')
  let preview = document.getElementById('imagePreview')
  if (!input || !preview) return

  let file = input.files[0]
  if (!file) {
    preview.style.display = 'none'
    preview.removeAttribute('src')
    return
  }

  let error = validateImage(file)
  if (error) {
    alert(error)
    input.value = ''
    preview.style.display = 'none'
    preview.removeAttribute('src')
    return
  }

  preview.src = URL.createObjectURL(file)
  preview.style.display = 'block'
}

// escapes user-typed text before it goes into innerHTML
function escapeHtml(text) {
  let div = document.createElement('div')
  div.textContent = text
  // innerHTML escapes < > & but not quotes, which matter inside attributes
  return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// POST JOB FUNCTION
async function postJob() {
  let title = document.getElementById('title').value
  let description = document.getElementById('description').value
  let budget = document.getElementById('budget').value
  let imageInput = document.getElementById('jobImage')
  let imageFile = imageInput.files[0]

  if (!title || !description || !budget) {
    alert('Please fill all fields')
    return
  }

  let image = ''
  if (imageFile) {
    let error = validateImage(imageFile)
    if (error) {
      alert(error)
      return
    }
    try {
      image = await fileToCompressedDataUrl(imageFile)
    } catch (err) {
      alert(err.message)
      return
    }
  }

  let job = {
    title: title,
    description: description,
    budget: budget,
    image: image,
    date: new Date().toLocaleString(),
  }

  let jobs = JSON.parse(localStorage.getItem('jobs')) || []
  jobs.unshift(job) // newest job first

  try {
    localStorage.setItem('jobs', JSON.stringify(jobs))
  } catch (err) {
    // browser storage is full - most likely because of saved images
    alert(
      'Could not save the job - browser storage is full. Try a smaller image or post without one.'
    )
    return
  }

  alert('Job Posted Successfully!')

  document.getElementById('title').value = ''
  document.getElementById('description').value = ''
  document.getElementById('budget').value = ''
  imageInput.value = ''
  previewJobImage()
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
    // jobs posted before image uploads existed have no image - skip the tag
    let imageTag = job.image
      ? `<div class="job-image-container" tabindex="0" role="button" aria-label="View full image">
           <img class="job-image" src="${job.image}" alt="${escapeHtml(job.title)}" />
         </div>`
      : ''

    container.innerHTML += `
            <div class="job-card">
                ${imageTag}
                <h3>${escapeHtml(job.title)}</h3>
                <p>${escapeHtml(job.description)}</p>
                <p><strong>Budget:</strong> $${escapeHtml(job.budget)}</p>
                <p><small>Posted: ${escapeHtml(job.date)}</small></p>
                <button>Apply</button>
            </div>
        `
  })
}

// ---------- IMAGE LIGHTBOX ----------
// Job images show cropped inside a fixed-size container. Clicking one opens
// the whole picture in an overlay. The overlay is built here (not in each
// HTML page) so it works on every page that loads script.js.
let lightbox = null
let lastFocused = null

function buildLightbox() {
  lightbox = document.createElement('div')
  lightbox.className = 'lightbox'
  lightbox.setAttribute('role', 'dialog')
  lightbox.setAttribute('aria-modal', 'true')
  lightbox.setAttribute('aria-label', 'Full image')
  lightbox.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Close image">&times;</button>' +
    '<img class="lightbox-img" alt="" />'
  document.body.appendChild(lightbox)

  // clicking the dark area (but not the picture itself) closes it
  lightbox.addEventListener('click', function (e) {
    if (e.target !== lightbox.querySelector('.lightbox-img')) closeLightbox()
  })
}

function openLightbox(src, alt) {
  if (!lightbox) buildLightbox()
  lastFocused = document.activeElement
  let img = lightbox.querySelector('.lightbox-img')
  img.src = src
  img.alt = alt || ''
  lightbox.classList.add('open')
  document.body.style.overflow = 'hidden' // stop the page scrolling behind it
  lightbox.querySelector('.lightbox-close').focus()
}

function closeLightbox() {
  if (!lightbox) return
  lightbox.classList.remove('open')
  document.body.style.overflow = ''
  if (lastFocused) lastFocused.focus()
}

// one listener handles every image, including ones added later by loadJobs()
document.addEventListener('click', function (e) {
  let box = e.target.closest('.job-image-container')
  if (!box) return
  let img = box.querySelector('img')
  openLightbox(img.src, img.alt)
})

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox()
  // let keyboard users open an image with Enter or Space
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('job-image-container')) {
    e.preventDefault()
    e.target.click()
  }
})

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
  window.location.href = './landing.html'
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
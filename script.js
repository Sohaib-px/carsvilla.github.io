document.addEventListener('DOMContentLoaded', () => {
  // Button and Form references
  const showRegistrationBtn = document.getElementById('show-registration-btn');
  const registerForm = document.getElementById('register-form');
  const proceedBtn = document.getElementById('proceed-btn');
  const showSignupBtn = document.getElementById('show-signup');
  const showLoginBtn = document.getElementById('show-login');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const aboutUsButton = document.getElementById('show-aboutus-btn');
  const contactUsButton = document.getElementById('show-contactus-btn');
  const villaSpecialButton = document.getElementById('show-villaspecial-btn');
  const showBookingBtn = document.getElementById('show-booking-btn');

  const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];

  // Handle Vehicle Save Button Click
  document.getElementById('save-vehicles').addEventListener('click', () => {
      if (!isFormComplete()) {
          alert('Kindly, fill the form completely');
          return;
      }

      const vehicleData = {
          type: document.getElementById('type').value,
          make: document.getElementById('make').value,
          model: document.getElementById('model').value,
          year: parseInt(document.getElementById('year').value),
          rate: parseInt(document.getElementById('rate').value)
      };

      // Save to localStorage
      vehicles.push(vehicleData);
      localStorage.setItem('vehicles', JSON.stringify(vehicles));

      // Send data to the server to save to the SQL database
      fetch('/save-vehicle', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(vehicleData)
      })
      .then(response => response.text())
      .then(data => {
          alert(data);
          window.location.href = 'lastpage.html';  // Redirect to last page
      })
      .catch(error => {
          console.error('Error:', error);
          alert('Failed to save vehicle data to the database.');
      });
  });

  // Show Registration Form
  if (showRegistrationBtn && registerForm) {
      showRegistrationBtn.addEventListener('click', () => {
          registerForm.style.display = 'block';
          showRegistrationBtn.style.display = 'none';
      });
  }

  // Proceed Button in Registration Form
  if (proceedBtn && registerForm) {
      proceedBtn.addEventListener('click', async (event) => {
          event.preventDefault();
          alert("Registration Successful!");

          const username = document.getElementById('username').value;
          const contact = document.getElementById('contact').value;

          try {
              const response = await fetch('/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, contact }),
              });

              if (response.ok) {
                  window.location.href = 'form.html';
              } else {
                  console.error('Registration failed');
              }
          } catch (error) {
              console.error('An error occurred:', error);
          }
      });
  }

  // Show Signup Form
  if (showSignupBtn && signupForm) {
      showSignupBtn.addEventListener('click', () => {
          signupForm.style.display = 'block';
          if (loginForm) loginForm.style.display = 'none';
      });
  }

  // Show Login Form
  if (showLoginBtn && loginForm) {
      showLoginBtn.addEventListener('click', () => {
          loginForm.style.display = 'block';
          if (signupForm) signupForm.style.display = 'none';
      });
  }

  // Handle Signup Form Submission
  if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const username = document.getElementById('signup-username').value;
          const email = document.getElementById('signup-email').value;
          const password = document.getElementById('signup-password').value;
          const confirmPassword = document.getElementById('confirm-password').value;

          const existingMessages = signupForm.querySelectorAll('.message-container');
          existingMessages.forEach(msg => msg.remove());

          if (password !== confirmPassword) {
              showMessage(signupForm, 'Passwords do not match. Please enter the passwords correctly.', 'red');
          } else {
              const user = { username, email, password };
              let users = JSON.parse(localStorage.getItem('users')) || [];
              users.push(user);
              localStorage.setItem('users', JSON.stringify(users));

              showMessage(signupForm, 'Sign Up successful! You can now log in.', 'blue');

              setTimeout(() => {
                  showLoginForm();
                  document.getElementById('login-username').focus();
              }, 2000);
          }
      });
  }

  // Handle Login Form Submission
  if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const username = document.getElementById('login-username').value;
          const password = document.getElementById('login-password').value;

          const users = JSON.parse(localStorage.getItem('users')) || [];
          const user = users.find(u => u.username === username && u.password === password);

          const existingMessages = loginForm.querySelectorAll('.message-container');
          existingMessages.forEach(msg => msg.remove());

          if (user) {
              showMessage(loginForm, 'Login successful! Redirecting...', 'green');

              setTimeout(() => {
                  window.location.href = 'home.html';
              }, 2000);
          } else {
              showMessage(loginForm, 'Login failed! Please check your username and password.', 'red');
              document.getElementById('login-username').value = '';
              document.getElementById('login-password').value = '';
          }
      });
  }

  // Navigation Buttons
  if (aboutUsButton) {
      aboutUsButton.addEventListener('click', () => {
          window.location.href = 'aboutus.html';
      });
  }

  if (contactUsButton) {
      contactUsButton.addEventListener('click', () => {
          window.location.href = 'contactus.html';
      });
  }

  if (villaSpecialButton) {
      villaSpecialButton.addEventListener('click', () => {
          window.location.href = 'databasecars.html';
      });
  }

  if (showBookingBtn) {
      showBookingBtn.addEventListener('click', () => {
          window.location.href = 'form.html';
      });
  }

  // Input Field Styling
  document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
          input.style.borderColor = '#007bff';
          input.style.boxShadow = '0 0 5px rgba(0, 123, 255, 0.5)';
      });
      input.addEventListener('blur', () => {
          input.style.borderColor = '#ccc';
          input.style.boxShadow = 'none';
      });
  });

  // Utility Function to Show Messages
  function showMessage(form, message, bgColor) {
      const messageContainer = document.createElement('div');
      messageContainer.textContent = message;
      messageContainer.className = 'message-container';
      messageContainer.style.backgroundColor = bgColor;
      messageContainer.style.color = 'white';
      messageContainer.style.padding = '10px';
      messageContainer.style.borderRadius = '5px';
      messageContainer.style.marginTop = '20px';
      messageContainer.style.textAlign = 'center';
      form.insertBefore(messageContainer, form.firstChild);
  }

  // Utility Function to Show Login Form
  function showLoginForm() {
      if (loginForm) loginForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
  }

  // Utility Function to Check if the Vehicle Form is Complete
  function isFormComplete() {
      const requiredFields = ['type', 'make', 'model', 'year', 'rate'];
      return requiredFields.every(id => document.getElementById(id).value.trim() !== '');
  }
});

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        // Custom password match validation for reset-password form
        var password = form.querySelector('input[name="pas"]');
        var confirmPassword = form.querySelector('input[name="re_pas"]');
        if (password && confirmPassword) {
          if (password.value !== confirmPassword.value) {
            event.preventDefault();
            event.stopPropagation();
            confirmPassword.setCustomValidity('Passwords do not match');
            confirmPassword.reportValidity();
            return;
          } else {
            confirmPassword.setCustomValidity('');
          }
        }
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      }, false)
    })
})()
function toggleIncrement(checkbox) {
  const incrementSection = checkbox.nextElementSibling;
  if (checkbox.checked) {
    incrementSection.style.display = 'flex';
  } else {
    incrementSection.style.display = 'none';
  }
}

function increment(button, maxValue) {
  const incrementValue = button.previousElementSibling;
  let value = parseInt(incrementValue.textContent);
  if (value < maxValue) {
    incrementValue.textContent = value + 1;
  }
}

function decrement(button) {
  const incrementValue = button.nextElementSibling;
  let value = parseInt(incrementValue.textContent);
  if (value > 0) {
    incrementValue.textContent = value - 1;
  }
}

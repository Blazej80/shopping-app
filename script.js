// Function to toggle increment section based on checkbox selection
function toggleIncrement(checkbox) {
  const productItem = checkbox.closest('.product-item');
  const incrementSection = productItem.querySelector('.increment-section');
  const incrementValue = incrementSection.querySelector('.increment-value');

  if (checkbox.checked) {
    incrementSection.classList.remove('hidden');
    incrementValue.textContent = '1'; // Ensure quantity starts at 1
  } else {
    incrementSection.classList.add('hidden');
    incrementValue.textContent = '1'; // Reset quantity when unchecked
  }

  // Call validateSelections regardless of checkbox state
  validateSelections();
}

// Increment and decrement functions
function increment(button, maxValue) {
  const incrementValue = button.previousElementSibling;
  let value = parseInt(incrementValue.textContent);
  if (value < maxValue) {
    incrementValue.textContent = value + 1;
  }
  validateSelections(); // Update button state
}

function decrement(button) {
  const incrementValue = button.nextElementSibling;
  let value = parseInt(incrementValue.textContent);
  if (value > 1) {
    incrementValue.textContent = value - 1;
  }
  validateSelections(); // Update button state
}

// Function to get the selected items
function getSelectedItems() {
  const productItems = document.querySelectorAll('.product-item');
  const selectedItems = [];

  productItems.forEach(item => {
    const checkbox = item.querySelector('.checkbox');
    const name = item.querySelector('.product-name').textContent;
    const maxValue = item.querySelector('.readonly-field').value;
    const selectedValue = item.querySelector('.increment-value').textContent;

    if (checkbox.checked) {
      selectedItems.push({
        name: name,
        maxQuantity: parseInt(maxValue),
        selectedQuantity: parseInt(selectedValue),
      });
    }
  });

  return selectedItems;
}

// Function to validate selections and update the save button state
function validateSelections() {
  const saveButton = document.querySelector('.save-button');
  const validationMessage = document.getElementById('validation-message');
  const selectedItems = getSelectedItems();

  if (selectedItems.length === 0) {
    saveButton.disabled = true;
    validationMessage.textContent = 'Wybierz przynajmniej jeden produkt';
    return;
  }

  const itemsWithZeroQuantity = selectedItems.filter(
    item => item.selectedQuantity <= 0
  );

  if (itemsWithZeroQuantity.length > 0) {
    saveButton.disabled = true;
    validationMessage.textContent =
      'Please ensure all selected items have a quantity greater than zero.';
    return;
  }

  saveButton.disabled = false;
  validationMessage.textContent = ''; // Clear the message when validation passes
}

// Function to save the shopping list to Realtime Database
function saveShoppingList() {
  const selectedItems = getSelectedItems();

  // Validation check: if no items are selected, alert and stop
  if (selectedItems.length === 0) {
    alert('Please select at least one item.');
    return;
  }

  // New validation: Ensure no selected items have a quantity of zero
  const itemsWithZeroQuantity = selectedItems.filter(
    item => item.selectedQuantity <= 0
  );

  if (itemsWithZeroQuantity.length > 0) {
    alert(
      'Please ensure all selected items have a quantity greater than zero.'
    );
    return;
  }

  // Proceed to save the shopping list
  console.log(
    'Saving the following items to Realtime Database:',
    selectedItems
  );

  const dbRef = firebase.database().ref('shoppingLists');

  dbRef
    .push({
      items: selectedItems,
      timestamp: new Date().toISOString(),
    })
    .then(() => {
      alert('Shopping list saved successfully!');
    })
    .catch(error => {
      console.error('Error saving shopping list:', error);
    });
}

// Fetching and rendering products by homegroup (limited to the first 2 items)
function renderProductsByHomegroup(products) {
  const productContainer = document.getElementById('product-list');
  const groups = {};

  // Group products by their homegroup and limit to 2 items
  products.forEach((product, index) => {
    const { homegroup } = product;
    if (!groups[homegroup]) {
      groups[homegroup] = [];
    }
    groups[homegroup].push(product);
  });

  // Get and sort group names
  const groupNames = Object.keys(groups);
  const groupOrder = {};

  groupNames.forEach(groupName => {
    const productsInGroup = groups[groupName];
    const minHomeorder = Math.min(...productsInGroup.map(p => p.homeorder));
    groupOrder[groupName] = minHomeorder;
  });

  groupNames.sort((a, b) => groupOrder[a] - groupOrder[b]);

  // Render products grouped by homegroup, sorted by homeorder
  groupNames.forEach(groupName => {
    const groupHeader = document.createElement('h2');
    groupHeader.textContent = groupName;
    productContainer.appendChild(groupHeader);

    // Sort products within the group
    groups[groupName].sort((a, b) => a.homeorder - b.homeorder);

    groups[groupName].forEach(product => {
      const maxValue = product.quantity;
      const productElement = document.createElement('li');
      productElement.classList.add('product-item');

      // Create elements
      const productName = document.createElement('span');
      productName.classList.add('product-name');
      productName.textContent = product.name;

      const readonlyField = document.createElement('input');
      readonlyField.type = 'text';
      readonlyField.classList.add('readonly-field');
      readonlyField.value = product.quantity;
      readonlyField.readOnly = true;

      // Create a container for the checkbox
      const checkboxContainer = document.createElement('div');
      checkboxContainer.classList.add('checkbox-container');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('checkbox');
      checkbox.id = `checkbox-${product.name}`;

      checkbox.addEventListener('change', () => {
        toggleIncrement(checkbox);
      });

      checkboxContainer.appendChild(checkbox);

      // Assemble increment section
      const incrementSection = document.createElement('div');
      incrementSection.classList.add('increment-section', 'hidden'); // Hidden by default

      const decrementButton = document.createElement('button');
      decrementButton.textContent = '-';
      decrementButton.setAttribute('aria-label', 'Decrease quantity');
      decrementButton.addEventListener('click', () => {
        decrement(decrementButton);
        validateSelections();
      });

      const incrementValue = document.createElement('span');
      incrementValue.classList.add('increment-value');
      incrementValue.textContent = '1';

      const incrementButton = document.createElement('button');
      incrementButton.textContent = '+';
      incrementButton.setAttribute('aria-label', 'Increase quantity');
      incrementButton.addEventListener('click', () => {
        increment(incrementButton, maxValue);
        validateSelections();
      });

      // Append elements to increment section
      incrementSection.appendChild(decrementButton);
      incrementSection.appendChild(incrementValue);
      incrementSection.appendChild(incrementButton);

      // Assemble product item
      productElement.appendChild(productName);
      productElement.appendChild(readonlyField);
      productElement.appendChild(checkboxContainer);
      productElement.appendChild(incrementSection);

      productContainer.appendChild(productElement);
    });
  });

  // Initial validation
  validateSelections();
}

// Fetch products from database and render
firebase
  .database()
  .ref('products')
  .once('value', snapshot => {
    const products = Object.values(snapshot.val());
    renderProductsByHomegroup(products);
  });

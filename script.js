document.addEventListener('DOMContentLoaded', () => {
  const ul = document.getElementById('sortable-list');

  // Function to sort list items
  function sortList() {
    const items = Array.from(ul.getElementsByTagName('li'));
    items.sort((a, b) => a.textContent.localeCompare(b.textContent));
    items.forEach((item) => ul.appendChild(item)); // Reattach sorted items
  }

  // Initial sort when page loads
  sortList();

  // Optional: Re-sort when new items are added or changed (not currently dynamic)
});

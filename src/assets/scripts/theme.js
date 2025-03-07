document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    // Define SVG icons
    const sunIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>`;
    
    const moonIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
    </svg>`;

    // Function to apply theme
    function applyTheme(theme) {
        // Add at the beginning of your applyTheme function
        if (!themeToggle || !themeIcon || !themeText) return;

        if (theme === 'dark') {
            // Dark theme settings
            document.body.classList.remove('bg-white', 'text-gray-900');
            document.body.classList.add('bg-black', 'text-white');
            
            // Update button to show Light Theme option
            themeToggle.classList.remove('bg-black');
            themeToggle.classList.add('bg-yellow-500', 'text-white');
            themeIcon.innerHTML = sunIcon;
            themeText.textContent = 'Light Theme';
            
            // Update all card backgrounds
            document.querySelectorAll('[class*="bg-gray-"]').forEach(element => {
                element.classList.remove('bg-gray-100');
                element.classList.add('bg-gray-800');
            });
            
            // Update text colors
            document.querySelectorAll('.text-gray-600').forEach(element => {
                element.classList.remove('text-gray-600');
                element.classList.add('text-gray-300');
            });
            
            document.querySelectorAll('.text-blue-600').forEach(element => {
                element.classList.remove('text-blue-600');
                element.classList.add('text-blue-400');
            });
        } else {
            // Light theme settings
            document.body.classList.remove('bg-black', 'text-white');
            document.body.classList.add('bg-white', 'text-gray-900');
            
            // Update button to show Dark Theme option
            themeToggle.classList.remove('bg-yellow-500');
            themeToggle.classList.add('bg-black', 'text-white');
            themeIcon.innerHTML = moonIcon;
            themeText.textContent = 'Dark Theme';
            
            // Update all card backgrounds
            document.querySelectorAll('[class*="bg-gray-"]').forEach(element => {
                element.classList.remove('bg-gray-800');
                element.classList.add('bg-gray-100');
            });
            
            // Update text colors
            document.querySelectorAll('.text-gray-300').forEach(element => {
                element.classList.remove('text-gray-300');
                element.classList.add('text-gray-600');
            });
            
            document.querySelectorAll('.text-blue-400').forEach(element => {
                element.classList.remove('text-blue-400');
                element.classList.add('text-blue-600');
            });
        }
    }

    // Toggle theme function
    function toggleTheme() {
        const currentTheme = document.body.classList.contains('bg-black') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Initialize theme based on saved preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // Add click event listener
    themeToggle.addEventListener('click', toggleTheme);
});
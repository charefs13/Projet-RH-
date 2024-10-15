// Sélectionne tous les boutons "Update"
let updateBtns = document.querySelectorAll('.update');

// Ajoute un écouteur d'événement à chaque bouton "Update"
updateBtns.forEach(button => {
    button.addEventListener('click', () => {
        // Récupère l'ID spécifique depuis le bouton cliqué
        let employeId = button.getAttribute('data-id');
        // Sélectionne le formulaire caché correspondant à cet ID
        let formToShow = document.getElementById('form' + employeId);
        // Affiche le formulaire
        formToShow.style.display = "block";
    });
});

// Sélectionne tous les boutons "Save"
let saveBtns = document.querySelectorAll('.save');

// Ajoute un écouteur d'événement à chaque bouton "Save"
saveBtns.forEach(button => {
    button.addEventListener('click', () => {
        // Trouve le formulaire parent et le cache après la sauvegarde
        let formToHide = button.closest('.hidden');
        formToHide.style.display = "none";
    });
});


// Sélectionne tous les boutons "Update" pour les ordinateurs
let updateComputerBtns = document.querySelectorAll('.update-computer');

// Ajoute un écouteur d'événement à chaque bouton
updateComputerBtns.forEach(button => {
    button.addEventListener('click', () => {
        // Récupère l'ID spécifique depuis le bouton cliqué
        let computerId = button.getAttribute('data-id');
        // Sélectionne le formulaire caché correspondant à cet ID
        let formToShow = document.getElementById('computerForm' + computerId);
        // Affiche le formulaire
        formToShow.style.display = "block";
    });
});

// Sélectionne tous les boutons "Save" dans les formulaires cachés

// Ajoute un écouteur pour masquer le formulaire après sauvegarde
saveBtns.forEach(button => {
    button.addEventListener('click', () => {
        let formToHide = button.closest('div.hidden');
        formToHide.style.display = "none";
    });
});



const openTaskContainer = document.querySelector(".openTaskContainer")
const closeTaskContainer = document.querySelector(".closeTaskContainer")
const taskContainer = document.querySelector(".taskContainer")

openTaskContainer.addEventListener('click', () => {

    taskContainer.style.display = "flex"
    openTaskContainer.style.display = "none"
})
closeTaskContainer.addEventListener('click', () => {
    taskContainer.style.display = "none"
    openTaskContainer.style.display = "block"

})

// Function to toggle all checkboxes
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.employee-checkbox');

    // Vérifie si le bouton "Select All" est coché
    const isChecked = selectAll.checked;

    // Sélectionne ou désélectionne toutes les cases à cocher en fonction de l'état de "Select All"
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}



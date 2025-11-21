export function initDragAndDrop(targetContainer) {
    let draggedItem = null;

    // Helper to find the element after the cursor
    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.color-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    document.querySelectorAll('.color-item').forEach(item => {
        // Mouse Events
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => item.style.opacity = '0.5', 0);
        });

        item.addEventListener('dragend', () => {
            draggedItem = null;
            item.style.opacity = '1';
        });

        // Touch Events (Mobile)
        item.addEventListener('touchstart', (e) => {
            draggedItem = item;
            item.style.opacity = '0.5';
            // Prevent scrolling while dragging
            document.body.style.overflow = 'hidden';
        }, { passive: false });

        item.addEventListener('touchend', (e) => {
            draggedItem = null;
            item.style.opacity = '1';
            document.body.style.overflow = '';
        });

        item.addEventListener('touchmove', (e) => {
            if (!draggedItem) return;
            e.preventDefault(); // Prevent scrolling

            const touch = e.touches[0];
            const afterElement = getDragAfterElement(targetContainer, touch.clientX);

            if (afterElement == null) {
                targetContainer.appendChild(draggedItem);
            } else {
                targetContainer.insertBefore(draggedItem, afterElement);
            }
        }, { passive: false });
    });

    // Mouse Drag Over (Desktop)
    targetContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'move';

        // Calculate insertion position
        const afterElement = getDragAfterElement(targetContainer, e.clientX);
        if (draggedItem) {
            if (afterElement == null) {
                targetContainer.appendChild(draggedItem);
            } else {
                targetContainer.insertBefore(draggedItem, afterElement);
            }
        }
    });

    targetContainer.addEventListener('drop', (e) => {
        e.preventDefault();
    });
}

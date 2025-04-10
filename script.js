import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import './menu.js';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsDiv = document.getElementById('search-results');
    const addBookForm = document.getElementById('add-book-form');
    const addBookManualButton = document.getElementById('add-book-manual-button');
    const libraryListDiv = document.getElementById('library-list');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const isbnInput = document.getElementById('isbn');
    const statusSelect = document.getElementById('status');

    // Configuración de Supabase (REEMPLAZA CON TUS CREDENCIALES)
    const supabaseUrl = 'https://kfecdtnoxudjnelipkff.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZWNkdG5veHVkam5lbGlwa2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODEwODQsImV4cCI6MjA1OTg1NzA4NH0.CsBIUfPTvzbbMrXuyYfq-JXAXRt_HSilbGczY6r_jUY';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    async function fetchLibrary() {
        const { data: books, error } = await supabase
            .from('books')
            .select('*')
            .order('title', { ascending: true }); // Ordenar por título

            console.log(books)
        if (error) {
            console.error('Error fetching library:', error);
            libraryListDiv.innerHTML = '<p>Error al cargar la biblioteca.</p>';
        } else {
            renderLibrary(books);
        }
    }

    fetchLibrary();

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchExternalBooks(query);
        } else {
            searchResultsDiv.innerHTML = '<p>Por favor, introduce un término de búsqueda.</p>';
        }
    });

    // Añadimos un evento para que el buscador funcione al pulsar Enter
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchExternalBooks(query);
            } else {
                searchResultsDiv.innerHTML = '<p>Por favor, introduce un término de búsqueda.</p>';
            }
        }
    });

    async function searchExternalBooks(query) {
        searchResultsDiv.innerHTML = '<p>Buscando libros...</p>';
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
            const data = await response.json();
            searchResultsDiv.innerHTML = '';
            if (data.items) {
                data.items.forEach(item => {
                    const bookInfo = item.volumeInfo;
                    const title = bookInfo.title || 'Sin título';
                    const author = bookInfo.authors ? bookInfo.authors.join(', ') : 'Autor desconocido';
                    const isbn = bookInfo.industryIdentifiers ? bookInfo.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier : '';

                    const bookElement = document.createElement('div');
                    bookElement.classList.add('book-item');
                    bookElement.innerHTML = `
                        <div class="book-info">
                            <strong>${title}</strong><br>
                            Autor: ${author}<br>
                            ISBN: ${isbn || 'No disponible'}
                        </div>
                        <div class="book-actions">
                            <button data-title="${title}" data-author="${author}" data-isbn="${isbn}" data-status="en-posesion" class="add-to-library">En posesión <i class="fas fa-check-circle"></i></button>
                            <button data-title="${title}" data-author="${author}" data-isbn="${isbn}" data-status="lo-quiero" class="add-to-library">Lo quiero <i class="fas fa-heart"></i></button>
                        </div>
                    `;
                    searchResultsDiv.appendChild(bookElement);
                });

                const addToLibraryButtons = document.querySelectorAll('.add-to-library');
                addToLibraryButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const title = this.dataset.title;
                        const author = this.dataset.author;
                        const isbn = this.dataset.isbn;
                        const status = this.dataset.status;

                        if (title && status) {
                            addBookToSupabase({ title, author, isbn, status });
                            alert(`Libro añadido como: ${status === 'en-posesion' ? 'En posesión' : 'Lo quiero'}`);
                        } else {
                            alert('Faltan datos para añadir el libro.');
                        }
                    });
                });

            } else {
                searchResultsDiv.innerHTML = '<p>No se encontraron libros con ese criterio.</p>';
            }
        } catch (error) {
            console.error('Error al buscar libros:', error);
            searchResultsDiv.innerHTML = '<p>Error al buscar libros. Por favor, inténtalo de nuevo.</p>';
        }
    }

    addBookManualButton.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const isbn = isbnInput.value.trim();
        const status = statusSelect.value;

        if (title) {
            await addBookToSupabase({ title, author, isbn, status });
            addBookForm.style.display = 'none';
            titleInput.value = '';
            authorInput.value = '';
            isbnInput.value = '';
        } else {
            alert('El título es obligatorio.');
        }
    });

    async function addBookToSupabase(book) {
        const { error } = await supabase
            .from('books')
            .insert([book]);

        if (error) {
            console.error('Error adding book:', error);
            alert('Error al añadir el libro.');
        } else {
            fetchLibrary();
        }
    }

    async function updateBookStatus(bookId, newStatus) {
        const { error } = await supabase
            .from('books')
            .update({ status: newStatus })
            .eq('id', bookId);

        if (error) {
            console.error('Error updating book status:', error);
            alert('Error al actualizar el estado.');
        } else {
            fetchLibrary();
        }
    }

    async function deleteBook(bookId) {
        if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', bookId);

            if (error) {
                console.error('Error deleting book:', error);
                alert('Error al eliminar el libro.');
            } else {
                fetchLibrary();
            }
        }
    }

    function renderLibrary(libraryData) {
        libraryListDiv.innerHTML = '';
        if (libraryData.length === 0) {
            libraryListDiv.innerHTML = '<p>Tu biblioteca está vacía.</p>';
            return;
        }
        libraryData.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book-item');
            bookElement.innerHTML = `
                <div class="book-info">
                    <strong>${book.title}</strong><br>
                    ${book.author ? 'Autor: ' + book.author + '<br>' : ''}
                    ${book.isbn ? 'ISBN: ' + book.isbn : ''}
                </div>
                <div class="book-actions">
                    <span class="status-icon ${book.status}">
                        ${book.status === 'en-posesion' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-heart"></i>'}
                    </span>
                    <select class="change-status" data-id="${book.id}">
                        <option value="en-posesion" ${book.status === 'en-posesion' ? 'selected' : ''}>En posesión</option>
                        <option value="lo-quiero" ${book.status === 'lo-quiero' ? 'selected' : ''}>Lo quiero</option>
                    </select>
                    <button class="delete-book" data-id="${book.id}">Eliminar</button>
                </div>
            `;
            libraryListDiv.appendChild(bookElement);
        });

        const deleteButtons = document.querySelectorAll('.delete-book');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const bookIdToDelete = this.dataset.id;
                deleteBook(parseInt(bookIdToDelete));
            });
        });

        const statusSelects = document.querySelectorAll('.change-status');
        statusSelects.forEach(select => {
            select.addEventListener('change', function() {
                const bookIdToUpdate = this.dataset.id;
                const newStatus = this.value;
                updateBookStatus(parseInt(bookIdToUpdate), newStatus);
            });
        });
    }

    // Funcionalidad de "Mi Biblioteca"
    const filterInput = document.getElementById('filter-input');

    filterInput.addEventListener('input', () => {
        const filterValue = filterInput.value.toLowerCase();
        const books = Array.from(libraryListDiv.children);

        books.forEach(book => {
            const text = book.textContent.toLowerCase();
            book.style.display = text.includes(filterValue) ? 'block' : 'none';
        });
    });

    // Funcionalidad de "Buscador"

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value;
        if (!query) return;

        searchResultsDiv.innerHTML = '<p>Buscando...</p>';

        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await response.json();

        searchResultsDiv.innerHTML = '';

        if (data.items) {
            for (const item of data.items) {
                const book = item.volumeInfo;
                const bookDiv = document.createElement('div');
                bookDiv.classList.add('book');

                const title = book.title || 'Sin título';
                const author = book.authors ? book.authors.join(', ') : 'Autor desconocido';
                const isbn = book.industryIdentifiers ? book.industryIdentifiers[0].identifier : 'Sin ISBN';

                const { data: existingBooks } = await supabase
                    .from('books')
                    .select('*')
                    .eq('isbn', isbn);

                if (existingBooks.length > 0) {
                    bookDiv.innerHTML = `<p><strong>${title}</strong> de ${author} (ISBN: ${isbn}) - <em>Ya lo tengo</em></p>`;
                } else {
                    bookDiv.innerHTML = `<p><strong>${title}</strong> de ${author} (ISBN: ${isbn})</p>
                        <button class="add-possession">En posesión</button>
                        <button class="add-wishlist">Lo quiero</button>`;
                }

                searchResultsDiv.appendChild(bookDiv);
            }
        } else {
            searchResultsDiv.innerHTML = '<p>No se encontraron resultados.</p>';
        }
    });

    // Funcionalidad de "Añadir Nuevo Libro"
    const addBookButton = document.getElementById('add-book-manual-button');

    addBookButton.addEventListener('click', async () => {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const isbn = document.getElementById('isbn').value;
        const status = document.getElementById('status').value;

        if (!title) {
            alert('El título es obligatorio.');
            return;
        }

        const { error } = await supabase
            .from('books')
            .insert([{ title, author, isbn, status }]);

        if (error) {
            alert('Error al guardar el libro: ' + error.message);
        } else {
            alert('Libro añadido correctamente.');
            addBookForm.reset();
        }
    });
});
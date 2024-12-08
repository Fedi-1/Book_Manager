// Storage handling
const Storage = {
    KEY: 'books',
    
    getBooks() {
        const books = localStorage.getItem(this.KEY);
        return books ? JSON.parse(books) : [];
    },

    saveBooks(books) {
        localStorage.setItem(this.KEY, JSON.stringify(books));
    },

    addBook(book) {
        const books = this.getBooks();
        book.id = crypto.randomUUID();
        books.push(book);
        this.saveBooks(books);
        return book;
    },

    updateBook(id, updates) {
        const books = this.getBooks();
        const index = books.findIndex(book => book.id === id);
        if (index !== -1) {
            books[index] = { ...books[index], ...updates };
            this.saveBooks(books);
            return books[index];
        }
        return null;
    },

    deleteBook(id) {
        const books = this.getBooks();
        const filteredBooks = books.filter(book => book.id !== id);
        this.saveBooks(filteredBooks);
    }
};

// UI handling
class BooksManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.editingBookId = null;
        this.renderBooks();
    }

    initializeElements() {
        this.elements = {
            booksGrid: document.getElementById('booksGrid'),
            modal: document.getElementById('modal'),
            bookForm: document.getElementById('bookForm'),
            addBookBtn: document.getElementById('addBookBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            statusFilter: document.getElementById('statusFilter'),
            modalTitle: document.getElementById('modalTitle')
        };
    }

    bindEvents() {
        this.elements.addBookBtn.addEventListener('click', () => this.openModal());
        this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
        this.elements.bookForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.elements.statusFilter.addEventListener('change', () => this.renderBooks());
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });
    }

    openModal(book = null) {
        this.editingBookId = book ? book.id : null;
        this.elements.modalTitle.textContent = book ? 'Edit Book' : 'Add New Book';
        
        if (book) {
            this.elements.bookForm.title.value = book.title;
            this.elements.bookForm.author.value = book.author;
            this.elements.bookForm.cover.value = book.cover;
            this.elements.bookForm.status.value = book.status;
            this.elements.bookForm.rating.value = book.rating;
        } else {
            this.elements.bookForm.reset();
        }

        this.elements.modal.classList.add('active');
    }

    closeModal() {
        this.elements.modal.classList.remove('active');
        this.elements.bookForm.reset();
        this.editingBookId = null;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const bookData = {
            title: this.elements.bookForm.title.value,
            author: this.elements.bookForm.author.value,
            cover: this.elements.bookForm.cover.value,
            status: this.elements.bookForm.status.value,
            rating: parseInt(this.elements.bookForm.rating.value)
        };

        if (this.editingBookId) {
            Storage.updateBook(this.editingBookId, bookData);
        } else {
            Storage.addBook(bookData);
        }

        this.closeModal();
        this.renderBooks();
    }

    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        card.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <span class="book-status status-${book.status}">${book.status.replace('-', ' ')}</span>
                <div class="book-rating">
                    ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}
                </div>
                <div class="book-actions">
                    <button class="btn-secondary edit-btn">Edit</button>
                    <button class="btn-secondary btn-danger delete-btn">Delete</button>
                </div>
            </div>
        `;

        // Add event listeners
        card.querySelector('.edit-btn').addEventListener('click', () => this.openModal(book));
        card.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this book?')) {
                Storage.deleteBook(book.id);
                this.renderBooks();
            }
        });

        return card;
    }

    renderBooks() {
        const books = Storage.getBooks();
        const filter = this.elements.statusFilter.value;
        const filteredBooks = filter === 'all' 
            ? books 
            : books.filter(book => book.status === filter);

        this.elements.booksGrid.innerHTML = '';
        
        if (filteredBooks.length === 0) {
            this.elements.booksGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">
                    No books found. Add some books to your collection!
                </div>
            `;
            return;
        }

        filteredBooks.forEach(book => {
            this.elements.booksGrid.appendChild(this.createBookCard(book));
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new BooksManager();
});
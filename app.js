const htmlSelectors = {

    "loadButton": () => document.getElementById("loadBooks"),
    "submitButton": () => document.querySelector("#create-form > button"),
    "titleElement": () => document.getElementById("title"),
    "authorElement": () => document.getElementById("author"),
    "isbnElement": () => document.getElementById("isbn"),
    "booksContainerElement": () => document.querySelector("table > tbody"),
    "errorContainerElement": () => document.getElementById("error-notification"),
    "editForm": () => document.getElementById("edit-form"),
    "editButton": () => document.querySelector("#edit-form > button"),
    "editTitleInput": () => document.getElementById("edit-title"),
    "editAuthorInput": () => document.getElementById("edit-author"),
    "editIsbnInput": () => document.getElementById("edit-isbn"),
}


htmlSelectors["loadButton"]()
    .addEventListener("click", fetchAllBooks);

htmlSelectors["submitButton"]()
    .addEventListener("click", createBook);

htmlSelectors["editButton"]()
    .addEventListener("click", editBook);

function createBook(e) {
    e.preventDefault();
    const titleInput = htmlSelectors["titleElement"]();
    const authorInput = htmlSelectors["authorElement"]();
    const isbnInput = htmlSelectors["isbnElement"]();

    if (titleInput.value !== "" && authorInput.value !== "" && isbnInput !== "") {
        const initObj = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: titleInput.value, author: authorInput.value, isbn: isbnInput.value })
        }
        fetch(`https://online-book-library.firebaseio.com/Books/.json`, initObj)
            .then(fetchAllBooks)
            .catch(handleError)

        titleInput.value = "";
        authorInput.value = "";
        isbnInput.value = "";
    }
}

function fetchAllBooks() {
    fetch("https://online-book-library.firebaseio.com/Books/.json")
        .then(res => res.json())
        .then(renderBooks)
        .catch(handleError)

}

function renderBooks(booksData) {
    const bookContainer = htmlSelectors["booksContainerElement"]();

    if (bookContainer.innerHTML != "") {
        bookContainer.innerHTML = "";
    }

    Object
        .keys(booksData)
        .forEach(bookId => {
            const { title, author, isbn } = booksData[bookId];

            const tableRow = createDomElement("tr", "", {}, {},
                createDomElement("td", title, {}, {}),
                createDomElement("td", author, {}, {}),
                createDomElement("td", isbn, {}, {}),
                createDomElement("td", "", {}, {},
                    createDomElement("button", "Edit", { "data-key": bookId }, { click: loadBookById }),
                    createDomElement("button", "Delete", { "data-key": bookId }, { click: deleteBook}))); 

            bookContainer.appendChild(tableRow);
        })
}

function handleError(err) {

    const errorContainer = htmlSelectors["errorContainerElement"]();
    errorContainer.style.display = "block";
    errorContainer.textContent = err.message;

    setTimeout(() => {
        errorContainer.style.display = "none";
    }, 5000);
}

function createDomElement(type, text, attributes, events, ...children) {
    const domElement = document.createElement(type);
    if (text != "") {
        domElement.textContent = text;
    }
    Object.entries(attributes)
        .forEach(([attrKey, attrValue]) => {
            domElement.setAttribute(attrKey, attrValue);
        });

    Object.entries(events)
        .forEach(([eventName, eventHandler]) => {
            domElement.addEventListener(eventName, eventHandler)
        });

    children
        .forEach((child) => {
            domElement.appendChild(child);
        });

    return domElement;
}

function loadBookById() {
    const id = this.getAttribute("data-key");
    fetch(`https://online-book-library.firebaseio.com/Books/${id}.json`)
        .then(res => res.json())
        .then(({ title, author, isbn }) => {
            htmlSelectors["editTitleInput"]().value = title;
            htmlSelectors["editAuthorInput"]().value = author;
            htmlSelectors["editIsbnInput"]().value = isbn;
            htmlSelectors["editForm"]().style.display = "block";
            htmlSelectors["editButton"]().setAttribute("data-key", id);
        })
        .catch(handleError);
}

function editBook(e) {
    e.preventDefault();

    const titleInput = htmlSelectors["editTitleInput"]();
    const authorInput = htmlSelectors["editAuthorInput"]();
    const isbnInput = htmlSelectors["editIsbnInput"]();


    if (titleInput.value !== "" && authorInput.value !== "" && isbnInput !== "") {
        const id = this.getAttribute("data-key");
        const initObj = {
            method: "PATCH",
            body: JSON.stringify({ title: titleInput.value, author: authorInput.value, isbn: isbnInput.value })
        }
        htmlSelectors["editForm"]().style.display = "none";
        fetch(`https://online-book-library.firebaseio.com/Books/${id}.json`, initObj)
            .then(fetchAllBooks)
            .catch(handleError)
    }
} 

function deleteBook() {
    const id = this.getAttribute("data-key"); 

    const initObj = {
        method: "DELETE", 
    } 
    fetch(`https://online-book-library.firebaseio.com/Books/${id}.json`, initObj) 
    .then(fetchAllBooks) 
    .catch(handleError) 
}


const urlPrefix = 'http://localhost:3000/quotes'
const urlLikes = 'http://localhost:3000/likes'
const urlEmbedLikes = urlPrefix + '?_embed=likes'

const quoteList = document.getElementById('quote-list');
const body = document.querySelector('body');


document.addEventListener('DOMContentLoaded', function() {   
    
    console.log('DOM Content Loaded')
    
    standardFetch()

    document.getElementById('new-quote-form').addEventListener('submit', formSubmit);
    
    appendStndSortBtn()
});

function appendStndSortBtn() {
    let sortBtn = document.createElement('button');
    sortBtn.innerText = 'Sort by Author: OFF';
    sortBtn.id = 'sort-btn';
    sortBtn.addEventListener('click', sortAndRedisplay)
    sortBtn.classList.add('btn-edit');
    body.prepend(sortBtn);    
}

function sortAndRedisplay(event) {
    // fetch(urlEmbedLikes)
    // .then(response => response.json())
    // .then(data => sortByName(data))
    // .then(orderedData => populateList(orderedData))
    // .then(result => toggleSorter(event))

    fetch(urlEmbedLikes + '&_sort=author')
    .then(response => response.json())
    .then(data => populateList(data))
    .then(result => toggleSorter());
}

function standardFetch() {
    fetch(urlEmbedLikes)
    .then(response => response.json())
    .then(json => populateList(json))
    .catch(error => alert(error.message));
}

function toggleSorter() {
    let sortBtn = document.getElementById('sort-btn');
    sortBtn.innerText = 'Sort by Author: ON';
    sortBtn.removeEventListener('click', sortAndRedisplay);
    sortBtn.addEventListener('click', unsortAndRedisplay);
}

function unsortAndRedisplay() {
    document.getElementById('sort-btn').remove();
    standardFetch();
    appendStndSortBtn();
}

function appendList(quote) {
    let li = document.createElement('li');
    li.classList.add('quote-card');
    li.id = 'quote-' + quote.id

    let blockquote = document.createElement('blockquote');
    blockquote.classList.add('blockquote');

    let quoteText = document.createElement('p')
    quoteText.classList.add('mb-0');
    quoteText.innerText = quote.quote;

    let quoteFooter = document.createElement('footer');
    quoteFooter.classList.add('blockquote-footer');
    quoteFooter.innerText = quote.author;

    let likeBtn = document.createElement('button');
    likeBtn.classList.add('btn-success');
    likeBtn.innerText = 'Likes: ';
    let likeCnt = document.createElement('span');
    likeCnt.innerText = quote.likes.length;
    likeBtn.appendChild(likeCnt);
    likeBtn.addEventListener('click', likeQuote);

    let deleteBtn = document.createElement('button')
    deleteBtn.classList.add('btn-delete');
    deleteBtn.innerText = 'Delete';
    deleteBtn.addEventListener('click', deleteQuote);

    let editBtn = document.createElement('button');
    editBtn.classList.add('btn-edit');
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', displayEditForm);

    let editForm = document.createElement('form');
    editForm.setAttribute('type', 'hidden');
    let inputQuote = document.createElement('textarea');
    inputQuote.rows = 8;
    inputQuote.cols = 60; 
    inputQuote.name = 'quote';
    inputQuote.defaultValue = quoteText.innerText;
    inputQuote.style.display = 'none';
    let inputAuthor = document.createElement('input');
    inputAuthor.name = 'author';
    inputAuthor.defaultValue = quoteFooter.innerText;
    inputAuthor.style.display = 'none'
    let completeEdit = document.createElement('button');
    completeEdit.style.display = 'none';
    completeEdit.innerText = "Submit";
    editForm.addEventListener('submit', patchQuote);

    editForm.appendChild(inputQuote);
    editForm.appendChild(inputAuthor);
    editForm.appendChild(completeEdit);

    blockquote.appendChild(quoteText);
    blockquote.appendChild(quoteFooter);
    const br = document.createElement('br');
    blockquote.appendChild(br);
    blockquote.appendChild(likeBtn);
    blockquote.appendChild(deleteBtn);
    blockquote.appendChild(editBtn);
    blockquote.appendChild(editForm);
    
    li.appendChild(blockquote);
    quoteList.appendChild(li);
    console.log(`Quote #${quote.id} loaded`);
}

function populateList(db) {
    quoteList.innerHTML = "";
    db.forEach(quote => appendList(quote))
}

function formSubmit(event) {
    event.preventDefault();

    let newQuote = document.getElementById('new-quote').value;
    let newAuthor = document.getElementById('author').value;

    let configObj = {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify( {
            "quote": newQuote,
            "author": newAuthor,
            "likes": []
            })
     }

     fetch(urlPrefix, configObj).then(response => response.json()).then(data => appendList(data));
}

function deleteQuote(event) {
    let quoteCard = event.target.parentElement.parentElement;
    let matchId = quoteCard.id.split('-')[1];

    let configObj = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    let url = urlPrefix + '/' + matchId;

    fetch(url, configObj).then(response => response.json()).then(removeFromList(quoteCard))
}

function removeFromList(quoteCard) {
    quoteCard.remove();
}

function likeQuote(event) {
    let quoteCard = event.target.parentElement.parentElement;
    let matchId = parseInt(quoteCard.id.split('-')[1]);

    let configObj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'quoteId': matchId,
            'createdAt': Date.now()
        })
    }

    fetch(urlLikes, configObj).then(response => response.json()).then(updateLikes(event));
}

function updateLikes(event) {
    let likeSpan = event.target.getElementsByTagName('span')[0];
    let beforeNum = parseInt(likeSpan.innerText);
    let newNum = beforeNum + 1;
    likeSpan.innerText = newNum;
}

function displayEditForm(event) {
    let editForm = event.target.parentElement.querySelector('form');
    editForm.removeAttribute('type');
    let inputFields = editForm.querySelectorAll('[style="display: none;"]')
    inputFields.forEach(field => field.style.display = 'inline-block');
    event.target.style.display = 'none';
}

function hideEditForm(quoteId) {
    let editBtn = document.getElementById('quote-' + quoteId).querySelector('.btn-edit');
    editBtn.style.display = 'inline-block';
    let editForm = document.getElementById('quote-' + quoteId).querySelector('form');
    debugger
    editForm.childNodes.forEach(field => field.style.display = 'none');
    editForm.setAttribute('type', 'hidden');
}

function patchQuote(event) {
    event.preventDefault();

    let quoteId = event.target.parentElement.parentElement.id.split('-')[1]

    let newQuote = event.target.querySelector('[name="quote"]').value;
    let newAuthor = event.target.querySelector('[name="author"]').value;

    let configObj = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            quote: newQuote,
            author: newAuthor
        })
    }

    fetch(urlPrefix + '/' + quoteId, configObj)
    .then(response => response.json())
    .then(data => { 
        displayUpdatedQuote(data)
        hideEditForm(quoteId)
    });
}

function displayUpdatedQuote(quote) {
    let quoteCard = document.getElementById('quote-' + quote.id);
    quoteCard.querySelector('.mb-0').innerText = quote.quote;
    quoteCard.querySelector('.blockquote-footer').innerText = quote.author;
}

// function sortByName(db) {
//     function compare(a, b) {
//         const optA = a.author
//         const optB = b.author

//         let comparison;
//         if (optA > optB) {
//             comparison = 1;
//         } else if (optB > optA ) {
//             comparison = -1;
//         }

//         return comparison;
//     }

//     return db.sort(compare);
// }
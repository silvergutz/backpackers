'use strict';

const APIURL = 'https://api.sheety.co/30b6e400-9023-4a15-8e6c-16aa4e3b1e72';

window.onload = function() {
  var itemsPerPage = 10;

  loadAccommodations(1, itemsPerPage);

  document.getElementById('filter-form').addEventListener('submit', e => {
    e.preventDefault();
    loadAccommodations(1, itemsPerPage);
  });
}

async function loadAccommodations(page, perPage) {
  setSummaryMessage('Carregando...');

  // Cleanup
  let currentCards = document.querySelectorAll('.card-wrapper');
  if (currentCards.length) {
    currentCards.forEach(elm => {
      if (elm.id != 'card-placeholder') {
        elm.parentNode.removeChild(elm);
      }
    })
  }

  try {
    const items = await fetchItemsFromApi(page, perPage);
    let totalItems = items.total;
    let pages = items.pages;

    updatePages(page, pages, perPage, totalItems);

    if (!totalItems) {
      setSummaryMessage('Não foi encontrada nenhuma acomodação, que tal tentar uma outra data?');
    } else {
      if (totalItems === 1) {
        setSummaryMessage('Foi encontrada 1 acomodação');
      } else {
        setSummaryMessage(`Foram encontradas ${totalItems} acomodações`);
      }
  
      const placeholder = document.getElementById('card-placeholder');
      const list = placeholder.parentNode;

      const checkin = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
      const days = calculateStayDays(checkin, checkout);
      
      items.data.map(item => {
        let card = placeholder.cloneNode(true);
        card.removeAttribute('id');
  
        let image = card.querySelector('.card-img-top');
        image.src = item.photo.replace(/aki_policy=.*/gi, 'aki_policy=x_medium');
        image.alt = item.name;
        
        let title = card.querySelector('.card-title'); 
        title.textContent = item.property_type;
        
        let content = card.querySelector('.card-text'); 
        content.textContent = item.name;
        
        let price = card.querySelector('.card-price > .unit > .value'); 
        price.textContent = item.price;
  
        let total = card.querySelector('.card-price > .total > .value');
        total.textContent = item.price * (days || 1);

        list.append(card);
      });
    }
  } catch(e) {
    console.error(e);
    setSummaryMessage('Ocorreu um erro ao buscar os dados...');
  }
}

function updatePages(current, pages, perPage, total) {
  const pagination = document.getElementById('accommodation-pagination');

  if (pages <= 0) {
    // Remove pagination elements if has nothing to show
    let children = pagination.querySelectorAll('*');
    if (children.length) {
      children.forEach(i => {
        i.parentNode.removeChild(i)
      });
    }
  } else {
    let ul = pagination.querySelector('ul');
    if (!ul) {
      ul = document.createElement('ul');
      ul.classList.add('pagination', 'justify-content-center');
      pagination.append(ul);
    }

    const items = ul.querySelectorAll('.page-item');

    // Remove if has any element
    if (items.length) {
      items.forEach(li => li.parentNode.removeChild(li));
    }

    for (let i = 1; i <= pages; i++) {
      let item = document.createElement('li');
      item.classList.add('page-item');

      let a = document.createElement('a');
      a.classList.add('page-link');
      a.textContent = i;

      if (i === current) {
        item.classList.add('active');
      } else {
        a.addEventListener('click', e => {
          e.preventDefault();
          const page = parseInt(item.textContent);
          loadAccommodations(page, perPage);
        });
      }

      item.append(a);
      ul.append(item);
    }

    // Description text of current progress of items exibition
    let description = pagination.querySelector('.pagination-description');
    if (!description) {
      description = document.createElement('div');
      description.classList.add('pagination-description');
      pagination.append(description);
    }

    let offset = perPage * (current - 1);
    description.textContent = `Exibindo ${offset + 1}-${Math.ceil(total, offset + perPage)} de ${total}`;
  }
}

function calculateStayDays(checkin, checkout) {
  var dateIn = new Date(checkin);
  var dateOut = new Date(checkout);
  var timeDiff = Math.abs(dateOut.getTime() - dateIn.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

async function fetchItemsFromApi(page, perPage) {
  const response = await fetch(APIURL);
  
  const textResponse = await response.text();
  const data = JSON.parse(textResponse);

  let total = data.length;
  let items = data;

  if (page && perPage) {
    if (total > perPage) {
      const offset = perPage * (page - 1);
      if (offset > total) {
        items = [];
      } else {
        items = data.slice(offset, offset+perPage);
      }
    }
  } 

  return {
    count: items.length,
    pages: Math.ceil(total / perPage),
    total,
    data: items,
  };
}

function setSummaryMessage(message) {
  document.getElementById('summary').textContent = message;
}
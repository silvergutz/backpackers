'use strict';

const APIURL = 'https://api.sheety.co/30b6e400-9023-4a15-8e6c-16aa4e3b1e72';

window.onload = function() {
  var itemsPerPage = 10;

  loadAccommodations(1, itemsPerPage);
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

    console.log(page, pages, perPage, totalItems);
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

      console.log(i, current);

      if (i === current) {
        item.classList.add('active');
      }

      let a = document.createElement('a');
      a.classList.add('page-link');
      a.textContent = i < 10 ? `0${i}` : i;
      a.href = '#';
      a.addEventListener('click', e => {
        e.preventDefault();
        const page = parseInt(item.textContent);
        loadAccommodations(page, perPage);
      });

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
    description.textContent = `${offset + 1}-${Math.ceil(total, offset + perPage)} de ${total}`;
  }
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
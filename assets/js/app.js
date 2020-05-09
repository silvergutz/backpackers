'use strict';

const APIURL = 'https://api.sheety.co/30b6e400-9023-4a15-8e6c-16aa4e3b1e72';

window.onload = function() {
  loadAccommodations();
}

function loadAccommodations() {
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

  fetch(APIURL).then(function(response) {
    console.log(response);

    if (response.status && response.status == 200) {
      response.text().then(data => {
        const items = JSON.parse(data);

        if (!items.length) {
          summary = 'Não foi encontrada nenhuma acomodação, que tal tentar uma outra data?';
        } else {
          summary = `Foram encontradas ${items.length} acomodações`;
  
          const placeholder = document.getElementById('card-placeholder');
          const list = placeholder.parentNode;
  
          items.map(item => {
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

        setSummaryMessage(summary);
      }).catch(e => {
        setSummaryMessage('Ocorreu um erro ao buscar os dados...');
      }); 
    }
  }).catch(e => {
    setSummaryMessage('Ocorreu um erro ao buscar os dados...');
  });
}

function setSummaryMessage(message) {
  document.getElementById('summary').textContent = message;
}
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10');
    const pokemons = response.data.results;

    const cards = await Promise.all(pokemons.map(async pokemon => {
      const detailsResponse = await axios.get(pokemon.url);
      const details = detailsResponse.data;

      return {
        id: details.id,
        name: details.name,
        imageUrl: details.sprites.front_default,
        height: details.height,
        weight: details.weight,
        abilities: details.abilities.map(ability => ability.ability.name).join(', ')
      };
    }));

    const html = generateHtml(cards);
    res.send(html);
  } catch (error) {
    console.error('Error al obtener los datos de la API:', error.message);
    res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la API' });
  }
});

function generateHtml(cards) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 1200px;
          }
          .card {
            background-color: #2a9d8f;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
            margin: 15px;
            padding: 20px;
            text-align: center;
            border-radius: 10px;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
          }
          .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
          }
          .card img {
            max-width: 100%;
            border-radius: 5px;
          }
          .card h2 {
            margin-top: 10px;
            font-size: 24px;
            color: #fff;
          }
          .card p {
            margin: 5px 0;
            color: #ddd;
          }
          .card .abilities {
            margin-top: 15px;
            color: #ccc;
          }
          .abilities-details {
            display: none;
            font-size: 14px;
            color: #777;
          }
          .abilities-button {
            background-color: #1a7c71;
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
          }
          .abilities-button:hover {
            background-color: #155e54;
          }
          .icon {
            color: #ff6f62;
            margin-right: 5px;
          }
          .background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.2);
            z-index: -1;
          }
        </style>
      </head>
      <body>
        <div class="background"></div>
        <div class="container">
          ${cards.map(generateCard).join('')}
        </div>
        <script>
          const abilitiesButtons = document.querySelectorAll('.abilities-button');
          
          abilitiesButtons.forEach(button => {
            button.addEventListener('click', () => {
              const details = button.nextElementSibling;
              details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });
          });
        </script>
      </body>
      </html>
    `;
  }
  function generateCard(card) {
    return `
      <div class="card">
        <img src="${card.imageUrl}" alt="${card.name}">
        <h2>${card.name}</h2>
        <p><i class="fas fa-ruler-vertical icon"></i><strong>Height:</strong> ${card.height}</p>
        <p><i class="fas fa-weight-hanging icon"></i><strong>Weight:</strong> ${card.weight}</p>
        <div class="abilities">
          <i class="fas fa-book-open icon"></i><strong>Abilities:</strong>
          <button class="abilities-button">Show Abilities</button>
          <div class="abilities-details">${card.abilities}</div>
        </div>
      </div>
    `;
  }
  
  app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
  });  
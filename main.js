const tapes = [
    { title: "Shark Tornado 3", genre: "Action" },
    { title: "Love in the Laundromat", genre: "RomCom" },
    { title: "Space Clowns", genre: "Sci-Fi" },
    { title: "Grandma’s Revenge", genre: "Horror" },
  ];
  
  const incoming = document.getElementById("incoming-tapes");
  const shelves = document.getElementById("shelves");
  const requestBox = document.getElementById("request-box");
  const serveButton = document.getElementById("serve-button");
  
  function renderTape(tape) {
    const div = document.createElement("div");
    div.className = "tape";
    div.draggable = true;
    div.innerText = `${tape.title} \n(${tape.genre})`;
    div.dataset.title = tape.title;
    div.dataset.genre = tape.genre;
    div.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", JSON.stringify(tape));
    });
    return div;
  }
  
  function populateIncoming() {
    tapes.forEach(tape => {
      incoming.appendChild(renderTape(tape));
    });
  }
  
  function setupShelves() {
    for (let i = 0; i < 4; i++) {
      const shelf = document.createElement("div");
      shelf.className = "tape-container";
      shelf.addEventListener("dragover", e => e.preventDefault());
      shelf.addEventListener("drop", e => {
        const tape = JSON.parse(e.dataTransfer.getData("text/plain"));
        shelf.appendChild(renderTape(tape));
      });
      shelves.appendChild(shelf);
    }
  }
  
  function randomRequest() {
    const genres = ["Action", "RomCom", "Sci-Fi", "Horror"];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    requestBox.innerText = `Customer wants a ${genre} movie.`;
    requestBox.dataset.genre = genre;
  }
  
  serveButton.addEventListener("click", () => {
    const genre = requestBox.dataset.genre;
    let found = false;
    shelves.childNodes.forEach(shelf => {
      shelf.childNodes.forEach(tape => {
        if (tape.dataset.genre === genre && !found) {
          shelf.removeChild(tape);
          found = true;
          alert("Customer satisfied!");
        }
      });
    });
    if (!found) alert("Customer disappointed...");
    randomRequest();
  });
  
  populateIncoming();
  setupShelves();
  randomRequest();
  
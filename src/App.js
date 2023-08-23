import { createRef, useEffect } from "react";
import "./style.css";

function App() {
  //Размер сетки
  const rows = 60;
  const cols = 150;

  let playing = false;

  let grid = new Array(rows);
  let nextGrid = new Array(rows);

  let timer;
  const reproductionTime = 100;

  //Ссылки на элементы
  let gridContainer = createRef();
  let btnStart = createRef();

  //Инициализация сетки
  const initializeGrids = () => {
    for (let i = 0; i < rows; i++) {
      grid[i] = new Array(cols);
      nextGrid[i] = new Array(cols);
    }
  };

  //Сброс сетки
  const resetGrids = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[i][j] = 0;
        nextGrid[i][j] = 0;
      }
    }
  };

  //Копирование и сброс сетки
  const copyAndResetGrid = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[i][j] = nextGrid[i][j];
        nextGrid[i][j] = 0;
      }
    }
  };

  //Создание таблицы
  const createTable = () => {
    if (!gridContainer) {
      console.error("Нету контейнера сетки");
    }

    let table = document.createElement("table");

    for (let i = 0; i < rows; i++) {
      let tr = document.createElement("tr");
      for (let j = 0; j < cols; j++) {
        let cell = document.createElement("td");
        cell.setAttribute("id", i + "_" + j);
        cell.setAttribute("class", "dead");
        cell.onclick = cellClickHandler;
        tr.appendChild(cell);
      }
      table.appendChild(tr);
    }
    gridContainer.current.appendChild(table);
  };

  //Нажатие на клетку
  function cellClickHandler() {
    console.log(this);
    let rowcol = this.id.split("_");
    let row = rowcol[0];
    let col = rowcol[1];

    let classes = this.getAttribute("class");
    if (classes.indexOf("live") > -1) {
      this.setAttribute("class", "dead");
      grid[row][col] = 0;
    } else {
      this.setAttribute("class", "live");
      grid[row][col] = 1;
    }
  }

  //Обновление
  const updateView = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let cell = document.getElementById(i + "_" + j);
        if (grid[i][j] === 0) {
          cell.setAttribute("class", "dead");
        } else {
          cell.setAttribute("class", "live");
        }
      }
    }
  };

  // Функции кнопок

  // Случайные распарядок
  const randomButtonHandler = () => {
    if (playing) return;
    clearButtonHandler();
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let isLive = Math.round(Math.random());

        if (isLive === 1) {
          let cell = document.getElementById(i + "_" + j);
          cell.setAttribute("class", "live");
          grid[i][j] = 1;
        }
      }
    }
  };

  // Очистка сетки
  const clearButtonHandler = () => {
    playing = false;

    btnStart.current.innerHTML = "start";
    clearTimeout(timer);

    let cellsList = document.getElementsByClassName("live");

    let cells = [];

    for (let i = 0; i < cellsList.length; i++) {
      cells.push(cellsList[i]);
    }
    for (let i = 0; i < cells.length; i++) {
      cells[i].setAttribute("class", "dead");
    }
    resetGrids();
  };

  // Старт/пауза игры
  const startButtonHandler = () => {
    if (playing) {
      playing = false;
      btnStart.current.innerHTML = "continue";
      clearTimeout(timer);
    } else {
      playing = true;
      btnStart.current.innerHTML = "pause";
      play();
    }
  };

  // Запуск игры
  const play = () => {
    computeNextGen();

    if (playing) {
      timer = setTimeout(play, reproductionTime);
    }
  };

  //Генерация поколения
  const computeNextGen = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        applyRules(i, j);
      }
    }

    copyAndResetGrid();
    updateView();
  };

  //Проверка на правило
  const applyRules = (row, col) => {
    const cellValue = grid[row][col];
    let numNeighbors = countNeighbors(row, col);

    if (cellValue === 1) {
      nextGrid[row][col] = numNeighbors === 2 || numNeighbors === 3 ? 1 : 0;
    } else if (cellValue === 0) {
      nextGrid[row][col] = numNeighbors === 3 ? 1 : 0;
    }
  };

  //Подсчет соседей
  const countNeighbors = (row, col) => {
    let count = 0;
    if (row - 1 >= 0) {
      if (grid[row - 1][col] === 1) count++;
    }
    if (row - 1 >= 0 && col - 1 >= 0) {
      if (grid[row - 1][col - 1] === 1) count++;
    }
    if (row - 1 >= 0 && col + 1 < cols) {
      if (grid[row - 1][col + 1] === 1) count++;
    }
    if (col - 1 >= 0) {
      if (grid[row][col - 1] === 1) count++;
    }
    if (col + 1 < cols) {
      if (grid[row][col + 1] === 1) count++;
    }
    if (row + 1 < rows) {
      if (grid[row + 1][col] === 1) count++;
    }
    if (row + 1 < rows && col - 1 >= 0) {
      if (grid[row + 1][col - 1] === 1) count++;
    }
    if (row + 1 < rows && col + 1 < cols) {
      if (grid[row + 1][col + 1] === 1) count++;
    }
    return count;
  };

  //Общая инициализация
  useEffect(() => {
    createTable();
    initializeGrids();
    resetGrids();
  }, []);

  return (
    <div className="app">
      <div id="gridContainer" ref={gridContainer}></div>
      <div className="controls">
        <button id="start" ref={btnStart} onClick={startButtonHandler}>
          start
        </button>
        <button id="clear" onClick={clearButtonHandler}>
          clear
        </button>
        <button id="random" onClick={randomButtonHandler}>
          random
        </button>
      </div>
    </div>
  );
}

export default App;

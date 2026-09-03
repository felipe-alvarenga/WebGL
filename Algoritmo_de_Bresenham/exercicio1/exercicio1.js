'use strict';

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  throw new Error('WebGL não está disponível neste navegador.');
}


// ============================================================
// SHADERS
// ============================================================

const vertexShaderSource = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;

  void main() {
    // Converte coordenadas de pixels para coordenadas WebGL.
    vec2 zeroToOne = a_position / (u_resolution - 1.0);
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;

    gl_Position = vec4(clipSpace, 0.0, 1.0);

    // Um ponto representa um pixel.
    gl_PointSize = 1.0;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  uniform vec4 u_color;

  void main() {
    gl_FragColor = u_color;
  }
`;


// ============================================================
// CRIAÇÃO DOS SHADERS
// ============================================================

function createShader(gl, type, source) {

  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Não foi possível criar o shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

    const log = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(`Erro ao compilar shader: ${log}`);
  }

  return shader;
}


// ============================================================
// CRIAÇÃO DO PROGRAMA
// ============================================================

function createProgram(gl, vertexSource, fragmentSource) {

  const vertexShader =
    createShader(gl, gl.VERTEX_SHADER, vertexSource);

  const fragmentShader =
    createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();

  if (!program) {
    throw new Error('Não foi possível criar o programa WebGL.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    const log = gl.getProgramInfoLog(program);

    gl.deleteProgram(program);

    throw new Error(`Erro ao ligar programa WebGL: ${log}`);
  }

  return program;
}


const program =
  createProgram(gl, vertexShaderSource, fragmentShaderSource);


const positionLocation =
  gl.getAttribLocation(program, 'a_position');

const resolutionLocation =
  gl.getUniformLocation(program, 'u_resolution');

const colorLocation =
  gl.getUniformLocation(program, 'u_color');


const positionBuffer = gl.createBuffer();

if (!positionBuffer) {
  throw new Error('Não foi possível criar o buffer.');
}


// ============================================================
// CORES
// ============================================================

const colors = [

  [0.0, 0.0, 1.0, 1.0], // 0 - azul
  [1.0, 0.0, 0.0, 1.0], // 1 - vermelho
  [0.0, 0.7, 0.0, 1.0], // 2 - verde
  [1.0, 0.6, 0.0, 1.0], // 3 - laranja
  [0.6, 0.0, 0.8, 1.0], // 4 - roxo
  [0.0, 0.8, 0.8, 1.0], // 5 - ciano
  [1.0, 0.0, 0.7, 1.0], // 6 - rosa
  [1.0, 1.0, 0.0, 1.0], // 7 - amarelo
  [0.3, 0.3, 0.3, 1.0], // 8 - cinza
  [1.0, 1.0, 1.0, 1.0]  // 9 - branco

];

let currentColorIndex = 0;


// Guarda a reta atualmente desenhada.
let currentLine = {
  x0: 0,
  y0: 0,
  x1: 0,
  y1: 0
};


// Guarda o primeiro clique.
let firstPoint = null;


// ============================================================
// ALGORITMO DE BRESENHAM
// ============================================================
//
// Esta é a versão generalizada do algoritmo.
// Ela funciona para:
//
// - linhas horizontais
// - linhas verticais
// - diagonais
// - inclinações positivas
// - inclinações negativas
// - qualquer direção
//
// Tudo é calculado com inteiros.
//
// ============================================================

function bresenham(x0, y0, x1, y1) {

  const points = [];

  let dx = Math.abs(x1 - x0);

  let sx = x0 < x1 ? 1 : -1;

  let dy = -Math.abs(y1 - y0);

  let sy = y0 < y1 ? 1 : -1;

  let error = dx + dy;


  while (true) {

    // Plota o pixel atual.
    points.push([x0, y0]);


    // Chegamos ao ponto final.
    if (x0 === x1 && y0 === y1) {
      break;
    }


    const e2 = 2 * error;


    if (e2 >= dy) {

      error += dy;
      x0 += sx;

    }


    if (e2 <= dx) {

      error += dx;
      y0 += sy;

    }

  }


  return points;
}


// ============================================================
// FUNÇÃO 1
// TRAÇAR LINHA
// ============================================================

function tracarLinha(x0, y0, x1, y1) {

  currentLine = {
    x0: x0,
    y0: y0,
    x1: x1,
    y1: y1
  };


  // Calcula todos os pixels usando Bresenham.
  const points =
    bresenham(x0, y0, x1, y1);


  desenharPixels(
    points,
    colors[currentColorIndex]
  );
}


// ============================================================
// FUNÇÃO 2
// MUDAR COR
// ============================================================

function mudarCor(indice) {

  if (indice < 0 || indice > 9) {
    return;
  }


  currentColorIndex = indice;


  // Redesenha a reta atual com a nova cor.
  tracarLinha(
    currentLine.x0,
    currentLine.y0,
    currentLine.x1,
    currentLine.y1
  );
}


// ============================================================
// DESENHA OS PIXELS COM WEBGL
// ============================================================

function desenharPixels(points, color) {

  // Limpa a tela.
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );


  gl.clearColor(
    0.0,
    0.0,
    0.0,
    1.0
  );


  gl.clear(
    gl.COLOR_BUFFER_BIT
  );


  gl.useProgram(program);


  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );


  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(points.flat()),
    gl.DYNAMIC_DRAW
  );


  gl.enableVertexAttribArray(
    positionLocation
  );


  gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );


  gl.uniform2f(
    resolutionLocation,
    canvas.width,
    canvas.height
  );


  gl.uniform4fv(
    colorLocation,
    color
  );


  // IMPORTANTE:
  // Não usamos GL_LINES.
  // Cada ponto calculado por Bresenham é desenhado
  // como um ponto individual.
  gl.drawArrays(
    gl.POINTS,
    0,
    points.length
  );
}


// ============================================================
// CONVERTE O CLIQUE DO MOUSE PARA COORDENADAS DO CANVAS
// ============================================================

function mouseToCanvas(event) {

  const rect =
    canvas.getBoundingClientRect();


  const x = Math.floor(
    (event.clientX - rect.left)
    * canvas.width
    / rect.width
  );


  // O sistema da aula considera (0,0)
  // no canto inferior esquerdo.

  const yFromTop = Math.floor(
    (event.clientY - rect.top)
    * canvas.height
    / rect.height
  );


  const y =
    canvas.height - 1 - yFromTop;


  return {

    x: Math.max(
      0,
      Math.min(canvas.width - 1, x)
    ),

    y: Math.max(
      0,
      Math.min(canvas.height - 1, y)
    )

  };
}


// ============================================================
// CLIQUES
// ============================================================

canvas.addEventListener(
  'click',
  (event) => {

    if (event.button !== 0) {
      return;
    }


    const point =
      mouseToCanvas(event);


    // Primeiro clique.
    if (firstPoint === null) {

      firstPoint = point;

      return;
    }

    // Segundo clique.
    tracarLinha(
      firstPoint.x,
      firstPoint.y,
      point.x,
      point.y
    );

    firstPoint = null;
  }
);

// Desabilita o menu do botão direito.
canvas.addEventListener(
  'contextmenu',
  (event) => {
    event.preventDefault();
  }
);

// ============================================================
// TECLAS 0-9
// ============================================================

document.addEventListener(
  'keydown',
  (event) => {

    if (/^[0-9]$/.test(event.key)) {

      mudarCor(
        Number(event.key)
      );

    }

  }
);

// ============================================================
// LINHA INICIAL
// ============================================================

tracarLinha(
  0,
  0,
  0,
  0
);

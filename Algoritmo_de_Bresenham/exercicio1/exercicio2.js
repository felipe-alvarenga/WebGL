'use strict';

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('Seu navegador não possui suporte a WebGL.');
  throw new Error('WebGL não disponível.');
}

// ============================================================
// SHADERS
// ============================================================

const vertexShaderSource = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;

  void main() {
    // Coordenadas do canvas (origem no canto inferior esquerdo)
    // -> coordenadas de recorte do WebGL.
    vec2 zeroToOne = a_position / (u_resolution - 1.0);
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;

    gl_Position = vec4(clipSpace, 0.0, 1.0);
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

function criarShader(gl, tipo, fonte) {
  const shader = gl.createShader(tipo);

  gl.shaderSource(shader, fonte);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const erro = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error('Erro no shader: ' + erro);
  }

  return shader;
}


// ============================================================
// CRIAÇÃO DO PROGRAMA
// ============================================================

function criarPrograma(gl, vertexSource, fragmentSource) {
  const vs = criarShader(
    gl,
    gl.VERTEX_SHADER,
    vertexSource
  );

  const fs = criarShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentSource
  );

  const programa = gl.createProgram();

  gl.attachShader(programa, vs);
  gl.attachShader(programa, fs);

  gl.linkProgram(programa);

  if (!gl.getProgramParameter(
    programa,
    gl.LINK_STATUS
  )) {

    const erro =
      gl.getProgramInfoLog(programa);

    gl.deleteProgram(programa);

    throw new Error(
      'Erro no programa WebGL: ' + erro
    );
  }

  return programa;
}


const program = criarPrograma(
  gl,
  vertexShaderSource,
  fragmentShaderSource
);


const positionLocation =
  gl.getAttribLocation(
    program,
    'a_position'
  );


const resolutionLocation =
  gl.getUniformLocation(
    program,
    'u_resolution'
  );


const colorLocation =
  gl.getUniformLocation(
    program,
    'u_color'
  );


const positionBuffer =
  gl.createBuffer();


// ============================================================
// CORES 0-9
// ============================================================

const colors = [

  [0.0, 0.0, 1.0, 1.0], // 0 - azul
  [1.0, 0.0, 0.0, 1.0], // 1 - vermelho
  [0.0, 0.8, 0.0, 1.0], // 2 - verde
  [1.0, 0.5, 0.0, 1.0], // 3 - laranja
  [0.6, 0.0, 0.9, 1.0], // 4 - roxo
  [0.0, 0.8, 0.9, 1.0], // 5 - ciano
  [1.0, 0.0, 0.7, 1.0], // 6 - rosa
  [1.0, 1.0, 0.0, 1.0], // 7 - amarelo
  [0.5, 0.5, 0.5, 1.0], // 8 - cinza
  [1.0, 1.0, 1.0, 1.0]  // 9 - branco

];


let corAtual = 0;


// ============================================================
// CONTROLE DO PROGRAMA
// ============================================================

// Modo atual:
// 'reta' ou 'triangulo'
let modo = 'reta';

// Pontos já clicados para construir a figura atual.
let cliques = [];

// Figura que está atualmente na tela.
let figuraAtual = {
  tipo: 'reta',
  pontos: [
    [0, 0],
    [0, 0]
  ]
};


// Elemento que mostra o estado do programa.
const status =
  document.getElementById('status');


function atualizarStatus() {

  const nomeModo =
    modo === 'reta'
      ? 'RETA'
      : 'TRIÂNGULO';

  const quantidade =
    modo === 'reta'
      ? '2'
      : '3';

  status.textContent =
    `Modo: ${nomeModo} | Cor: ${corAtual} | ` +
    `Cliques: ${cliques.length}/${quantidade}`;
}


// ============================================================
// ALGORITMO DE BRESENHAM
// ============================================================
//
// Versão generalizada.
//
// Funciona para:
// - retas horizontais
// - retas verticais
// - diagonais
// - inclinações positivas
// - inclinações negativas
// - qualquer direção
//
// ============================================================

function bresenham(
  x0,
  y0,
  x1,
  y1
) {

  const pontos = [];


  let dx =
    Math.abs(x1 - x0);


  let sx =
    x0 < x1
      ? 1
      : -1;


  let dy =
    -Math.abs(y1 - y0);


  let sy =
    y0 < y1
      ? 1
      : -1;


  let erro =
    dx + dy;


  while (true) {

    // Guarda o pixel atual.
    pontos.push([
      x0,
      y0
    ]);


    // Chegamos ao ponto final.
    if (
      x0 === x1 &&
      y0 === y1
    ) {

      break;
    }


    const e2 =
      2 * erro;


    if (e2 >= dy) {

      erro += dy;
      x0 += sx;

    }


    if (e2 <= dx) {

      erro += dx;
      y0 += sy;

    }

  }


  return pontos;
}


// ============================================================
// LIMPAR TELA
// ============================================================

function limparTela() {

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
}


// ============================================================
// DESENHAR PIXELS
// ============================================================

function desenharPixels(pontos) {

  gl.useProgram(program);


  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );


  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(
      pontos.flat()
    ),
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
    colors[corAtual]
  );


  // IMPORTANTE:
  // Não utilizamos GL_LINES.
  //
  // Cada ponto produzido pelo Bresenham
  // é desenhado individualmente.
  gl.drawArrays(
    gl.POINTS,
    0,
    pontos.length
  );
}


// ============================================================
// FUNÇÃO 1
// TRAÇAR RETA
// ============================================================

function tracarLinha(p1, p2) {

  const pontos =
    bresenham(
      p1[0],
      p1[1],
      p2[0],
      p2[1]
    );


  limparTela();


  desenharPixels(pontos);


  figuraAtual = {

    tipo: 'reta',

    pontos: [
      p1,
      p2
    ]

  };
}


// ============================================================
// FUNÇÃO 2
// MUDAR COR
// ============================================================

function mudarCor(indice) {

  corAtual = indice;


  redesenharFigura();


  atualizarStatus();
}


// ============================================================
// FUNÇÃO 3
// TRAÇAR TRIÂNGULO
// ============================================================

function tracarTriangulo(
  p1,
  p2,
  p3
) {

  // Primeiro lado
  const lado1 =
    bresenham(
      p1[0],
      p1[1],
      p2[0],
      p2[1]
    );


  // Segundo lado
  const lado2 =
    bresenham(
      p2[0],
      p2[1],
      p3[0],
      p3[1]
    );


  // Terceiro lado
  const lado3 =
    bresenham(
      p3[0],
      p3[1],
      p1[0],
      p1[1]
    );


  // Junta todos os pixels.
  const pontos = [

    ...lado1,
    ...lado2,
    ...lado3

  ];


  limparTela();


  desenharPixels(pontos);


  figuraAtual = {

    tipo: 'triangulo',

    pontos: [
      p1,
      p2,
      p3
    ]

  };
}


// ============================================================
// REDESENHAR FIGURA ATUAL
// ============================================================

function redesenharFigura() {

  // ------------------------------------------
  // RETA
  // ------------------------------------------

  if (
    figuraAtual.tipo === 'reta'
  ) {

    const [
      p1,
      p2
    ] = figuraAtual.pontos;


    const pontos =
      bresenham(
        p1[0],
        p1[1],
        p2[0],
        p2[1]
      );


    limparTela();


    desenharPixels(pontos);

  }


  // ------------------------------------------
  // TRIÂNGULO
  // ------------------------------------------

  else {

    const [
      p1,
      p2,
      p3
    ] = figuraAtual.pontos;


    const lado1 =
      bresenham(
        p1[0],
        p1[1],
        p2[0],
        p2[1]
      );


    const lado2 =
      bresenham(
        p2[0],
        p2[1],
        p3[0],
        p3[1]
      );


    const lado3 =
      bresenham(
        p3[0],
        p3[1],
        p1[0],
        p1[1]
      );


    limparTela();


    desenharPixels([
      ...lado1,
      ...lado2,
      ...lado3
    ]);

  }
}


// ============================================================
// CONVERTER MOUSE PARA COORDENADAS DO CANVAS
// ============================================================

function mouseParaCanvas(event) {

  const rect =
    canvas.getBoundingClientRect();


  const x =
    Math.floor(
      (event.clientX - rect.left)
      * canvas.width
      / rect.width
    );


  const yDeCima =
    Math.floor(
      (event.clientY - rect.top)
      * canvas.height
      / rect.height
    );


  // Transformamos a origem para
  // o canto inferior esquerdo.

  const y =
    canvas.height -
    1 -
    yDeCima;


  return [

    Math.max(
      0,
      Math.min(
        canvas.width - 1,
        x
      )
    ),

    Math.max(
      0,
      Math.min(
        canvas.height - 1,
        y
      )
    )

  ];
}


// ============================================================
// CLIQUE DO MOUSE
// ============================================================

canvas.addEventListener(
  'mousedown',
  (event) => {

    // Somente botão esquerdo.
    if (event.button !== 0) {
      return;
    }


    const ponto =
      mouseParaCanvas(event);


    cliques.push(ponto);


    // ========================================
    // MODO RETA
    // ========================================

    if (
      modo === 'reta' &&
      cliques.length === 2
    ) {

      tracarLinha(
        cliques[0],
        cliques[1]
      );


      // Reinicia para permitir
      // desenhar outra reta.
      cliques = [];

    }


    // ========================================
    // MODO TRIÂNGULO
    // ========================================

    if (
      modo === 'triangulo' &&
      cliques.length === 3
    ) {

      tracarTriangulo(
        cliques[0],
        cliques[1],
        cliques[2]
      );


      // Reinicia para permitir
      // desenhar outro triângulo.
      cliques = [];

    }


    atualizarStatus();

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
// TECLADO
// ============================================================

document.addEventListener(
  'keydown',
  (event) => {

    const tecla =
      event.key.toLowerCase();


    // ========================================
    // R = RETA
    // ========================================

    if (tecla === 'r') {

      modo = 'reta';

      cliques = [];

      atualizarStatus();

      return;
    }


    // ========================================
    // T = TRIÂNGULO
    // ========================================

    if (tecla === 't') {

      modo = 'triangulo';

      cliques = [];

      atualizarStatus();

      return;
    }


    // ========================================
    // 0 - 9 = COR
    // ========================================

    if (
      /^[0-9]$/.test(event.key)
    ) {

      mudarCor(
        Number(event.key)
      );

    }

  }
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

// Limpa o canvas.
limparTela();


// Desenha inicialmente:
// (0,0) -> (0,0)
//
// Cor inicial = azul (índice 0).
tracarLinha(
  [0, 0],
  [0, 0]
);


cliques = [];


atualizarStatus();

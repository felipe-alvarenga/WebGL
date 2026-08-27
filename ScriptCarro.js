const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// ==========================
// VERTEX SHADER
// ==========================

const vertexShaderSource = `
    attribute vec2 position;

    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;


// ==========================
// FRAGMENT SHADER
// ==========================

const fragmentShaderSource = `
    precision mediump float;

    uniform vec3 cor;

    void main() {
        gl_FragColor = vec4(cor, 1.0);
    }
`;


// ==========================
// CRIAR OS SHADERS
// ==========================

function criarShader(tipo, fonte) {

    const shader = gl.createShader(tipo);

    gl.shaderSource(shader, fonte);

    gl.compileShader(shader);

    return shader;
}

const vertexShader =
    criarShader(gl.VERTEX_SHADER, vertexShaderSource);

const fragmentShader =
    criarShader(gl.FRAGMENT_SHADER, fragmentShaderSource);


// ==========================
// CRIAR O PROGRAMA
// ==========================

const programa = gl.createProgram();
gl.attachShader(programa, vertexShader);
gl.attachShader(programa, fragmentShader);
gl.linkProgram(programa);
gl.useProgram(programa);

// ==========================
// FUNÇÃO PARA DESENHAR CÍRCULO
// ==========================

function desenharCirculo(centroX, centroY, raio, cor) {

    const vertices = [];

    // Adiciona o centro do círculo
    vertices.push(centroX, centroY);

    // Quantidade de pontos da circunferência
    const quantidadePontos = 100;

    // Cria os pontos ao redor do círculo
    for (let i = 0; i <= quantidadePontos; i++) {

        const angulo =
            (i / quantidadePontos) * Math.PI * 2;

        const x =
            centroX + Math.cos(angulo) * raio;

        const y =
            centroY + Math.sin(angulo) * raio;

        vertices.push(x, y);
    }

    // ==========================
    // CRIAR O BUFFER
    // ==========================

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    // ==========================
    // LIGAR OS VÉRTICES
    // ==========================

    const position =
        gl.getAttribLocation(programa, "position");

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // ==========================
    // DESENHAR O CÍRCULO
    // ==========================

    const localCor = gl.getUniformLocation(programa, "cor");
    gl.uniform3fv(localCor, cor);

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        vertices.length / 2
    );
}

function desenharQuartoCirculo(centroX, centroY, raio, cor) {

    const vertices = [];

    // Adiciona o centro do círculo
    vertices.push(centroX, centroY);

    // Quantidade de pontos da circunferência
    const quantidadePontos = 100;

    // Cria os pontos ao redor do círculo
    for (let i = 0; i <= quantidadePontos; i++) {

        const angulo =
            (i / quantidadePontos) * Math.PI / 2;

        const x =
            centroX + Math.cos(angulo) * raio;

        const y =
            centroY + Math.sin(angulo) * raio;

        vertices.push(x, y);
    }

    // ==========================
    // CRIAR O BUFFER
    // ==========================

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    // ==========================
    // LIGAR OS VÉRTICES
    // ==========================

    const position =
        gl.getAttribLocation(programa, "position");

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // ==========================
    // DESENHAR O CÍRCULO
    // ==========================

    const localCor = gl.getUniformLocation(programa, "cor");
    gl.uniform3fv(localCor, cor);

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        vertices.length / 2
    );
}

function desenharQuarto2Circulo(centroX, centroY, raio, cor) {

    const vertices = [];

    // Adiciona o centro do círculo
    vertices.push(centroX, centroY);

    // Quantidade de pontos da circunferência
    const quantidadePontos = 100;

    // Cria os pontos ao redor do círculo
    for (let i = 0; i <= quantidadePontos; i++) {

        const angulo =
            Math.PI / 2 + (i / quantidadePontos) * Math.PI / 2;

        const x =
            centroX + Math.cos(angulo) * raio;

        const y =
            centroY + Math.sin(angulo) * raio;

        vertices.push(x, y);
    }

    // ==========================
    // CRIAR O BUFFER
    // ==========================

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    // ==========================
    // LIGAR OS VÉRTICES
    // ==========================

    const position =
        gl.getAttribLocation(programa, "position");

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // ==========================
    // DESENHAR O CÍRCULO
    // ==========================

    const localCor = gl.getUniformLocation(programa, "cor");
    gl.uniform3fv(localCor, cor);

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        vertices.length / 2
    );
}

// ==========================
// FUNÇÃO PARA DESENHAR RETÂNGULO
// ==========================

function desenharParalelepipedo(centroX, centroY, A, B, cor) {

    // Calcula os limites do retângulo
    const esquerda = centroX - A / 2;
    const direita  = centroX + A / 2;

    const baixo = centroY - B / 2;
    const cima  = centroY + B / 2;

    // Os 4 vértices do retângulo
    const vertices = [
        esquerda, baixo,
        direita,  baixo,
        esquerda, cima,
        direita,  cima
    ];

    // Criar buffer
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    // Localização da posição
    const position =
        gl.getAttribLocation(programa, "position");

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // Definir a cor
    const localCor =
        gl.getUniformLocation(programa, "cor");

    gl.uniform3fv(localCor, cor);

    // Desenhar o retângulo
    gl.drawArrays(
        gl.TRIANGLE_STRIP,
        0,
        4
    );
}

function desenharTriangulo(centroX, centroY, tamanho, cor) {

    const altura = tamanho * Math.sqrt(3) / 2;

    const vertices = [

        // Ponta superior
        centroX,
        centroY + (2 * altura / 3),

        // Ponta inferior esquerda
        centroX - tamanho / 2,
        centroY - (altura / 3),

        // Ponta inferior direita
        centroX + tamanho / 2,
        centroY - (altura / 3)
    ];


    // Criar buffer
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );


    // Posição dos vértices
    const position =
        gl.getAttribLocation(programa, "position");

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );


    // Cor
    const localCor =
        gl.getUniformLocation(programa, "cor");

    gl.uniform3fv(localCor, cor);


    // Desenhar triângulo
    gl.drawArrays(
        gl.TRIANGLES,
        0,
        3
    );
}

// ==========================
// LIMPAR A TELA
// ==========================

// Fundo preto
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

desenharCirculo(-0.3, -0.3, 0.15, [0.25, 0.25, 0.25]); //roda frontal
desenharCirculo(0.3, -0.3, 0.15, [0.25, 0.25, 0.25]); //roda traseira
desenharQuartoCirculo(0.3, -0.3, 0.3, [1.0, 0.0, 0.0]); //traseira
desenharQuarto2Circulo(-0.3, -0.3, 0.3, [1.0, 0.0, 0.0]); //para-choque
desenharQuarto2Circulo(-0.45, -0.2, 0.1, [1.0, 1.0, 1.0]); //lanterna
desenharParalelepipedo(0.0, -0.15, 0.6, 0.3, [1.0, 0.0, 0.0]); //corpo
desenharTriangulo(-0.115, 0.09, 0.4, [1.0, 0.0, 0.0]); //janela-corpo-frente
desenharTriangulo(0.2, -0.03, 0.6, [1.0, 0.0, 0.0]); //janela-corpo-trás
desenharParalelepipedo(0.04, 0.15, 0.313, 0.35, [1.0, 0.0, 0.0]); //janela-corpo-meio
desenharTriangulo(-0.1, 0.1, 0.3, [0.5, 0.5, 0.5]); //janela-frente
desenharTriangulo(0.18, 0.1, 0.3, [0.5, 0.5, 0.5]); //janela-trás
desenharParalelepipedo(0.04, 0.15, 0.27, 0.25, [0.5, 0.5, 0.5]); //janela-meio
desenharParalelepipedo(0.04, 0.15, 0.01, 0.3, [1.0, 0.0, 0.0]); //divisa
